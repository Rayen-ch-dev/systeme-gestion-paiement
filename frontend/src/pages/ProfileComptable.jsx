import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { emailRegex } from "../utils/data";
import { getProfileComptable, updateProfileComptable } from "../api";
// removed jwt-decode import due to ESM default export issue
import { extractRIBFromImage, validateRIB, formatRIB } from "../utils/ribExtractor";

export default function ProfilePage() {
  const navigate = useNavigate();

  const banks = useMemo(
    () => [
      "BIAT (Banque Internationale Arabe de Tunisie)",
      "Amen Bank",
      "ATB (Arab Tunisian Bank)",
      "BH Bank (Banque de l'Habitat)",
      "BNA (Banque Nationale Agricole)",
      "STB (Société Tunisienne de Banque)",
      "UIB (Union Internationale de Banques)",
      "UBCI (Union Bancaire pour le Commerce et l'Industrie)",
      "BT (Banque de Tunisie)",
      "BTK (Banque Tuniso-Koweïtienne)",
      "Banque Zitouna",
      "QNB Tunisie (Qatar National Bank)",
      "ABC Bank (Arab Banking Corporation)",
      "Banque Al Baraka",
      "Wifak Bank",
      "Tunisian Foreign Bank (TFBank)",
      "Banque de Tunisie et des Émirats (BTE)",
      "Banque de Financement des Petites et Moyennes Entreprises (BFPME)",
    ],
    []
  );

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    cin: "",
    email: "",
    banque: "",
    rib: "",
  });
  const [userId, setUserId] = useState(null);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  const [extractingRIB, setExtractingRIB] = useState(false);
  const [ribError, setRibError] = useState("");
  const [ribSuccess, setRibSuccess] = useState("");
  const [ribImagePreview, setRibImagePreview] = useState(null);

  const initials = `${(form.name || "U")[0] || ""}${(form.lastname || "")[0] || ""}`.toUpperCase();

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const onBlur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }));

  const validate = useMemo(
    () => (data) => {
      const e = {};
      if (!data.name.trim()) e.name = "Prénom requis";
      if (!data.lastname.trim()) e.lastname = "Nom requis";
      if (!data.cin.trim() || !/^[A-Z0-9]{5,15}$/i.test(data.cin)) e.cin = "CIN invalide";
      if (!emailRegex.test(data.email)) e.email = "Email invalide";
      if (!data.banque || !data.banque.trim()) e.banque = "Banque requise";
      if (data.rib && !validateRIB(data.rib)) e.rib = "RIB invalide";
      return e;
    },
    []
  );

  useEffect(() => {
    setErrors(validate(form));
  }, [form, validate]);

  // small, dependency-free JWT decode to avoid jwt-decode bundling issues
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("decodeJwt error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = decodeJwt(token);
      if (decoded) setUserId(decoded.id || decoded._id);
    } catch (err) {
      console.error("Token invalide :", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const p = await getProfileComptable(userId);
        if (p && p.ok) {
          const u = (p.user && p.user.user) || p.user || p;
          setForm((s) => ({
            ...s,
            name: (u && (u.name || "")) || "",
            lastname: (u && (u.lastname || u.lastName || "")) || "",
            cin: (u && (u.cin || "")) || "",
            email: (u && (u.email || "")) || "",
            banque: (u && (u.banque || "")) || "",
            rib: (u && (u.rib || "")) || "",
          }));
        } else {
          console.error("Erreur de chargement du profil :", p?.error || p);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil :", err);
      }
    })();
  }, [userId]);

  const canSave = Object.keys(errors).length === 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    const eMap = validate(form);
    setErrors(eMap);
    setTouched({
      name: true,
      lastname: true,
      cin: true,
      email: true,
      banque: true,
      rib: true,
    });
    if (Object.keys(eMap).length > 0) return;

    setSaving(true);
    try {
      const result = await updateProfileComptable({ ...form, id: userId });
      if (result && result.ok) {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          navigate("/AdminDashboard");
        }, 1500);
      } else {
        console.error("Erreur de mise à jour :", result?.error || result);
      }
    } catch (err) {
      console.error("Erreur inattendue :", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/AdminDashboard");
  };

  const handleRIBImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setRibImagePreview(reader.result);
    reader.readAsDataURL(file);

    setExtractingRIB(true);
    setRibError("");
    setRibSuccess("");

    try {
      const result = await extractRIBFromImage(file);
      if (result && result.success) {
        setForm((s) => ({ ...s, rib: result.rib }));
        setRibSuccess(`RIB extrait avec succès : ${formatRIB(result.rib)}`);
        setTimeout(() => setRibSuccess(""), 5000);
      } else {
        setRibError(result?.error || "Impossible d'extraire le RIB");
      }
    } catch (err) {
      console.error("Erreur extraction RIB:", err);
      setRibError("Erreur lors de l'extraction du RIB");
    } finally {
      setExtractingRIB(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-slate-50 overflow-hidden">
      <div className="w-full max-w-2xl relative">
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-md border border-white/70">
          <div className="p-7 pb-3">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">
                  {initials}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Profil</h1>
                  <div className="text-xs text-slate-500">Gérer vos informations de compte</div>
                </div>
              </div>
            </div>

            {saved && (
              <div className="fixed top-5 right-5 z-50 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm shadow-sm">
                Profil enregistré avec succès.
              </div>
            )}

            <div className="border-b border-white/60 mb-4">
              <nav className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("profil")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "profil" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
                >
                  Profil
                </button>
                <button
                  disabled
                  type="button"
                  onClick={() => setActiveTab("securite")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "securite" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
                />
              </nav>
            </div>

            <form onSubmit={onSubmit} className="p-2">
              {activeTab === "profil" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["name", "lastname", "cin", "email"].map((field) => (
                    <label key={field} className="block">
                      <span className="text-sm text-slate-700 capitalize">
                        {field === "name" ? "Prénom" : field === "lastname" ? "Nom" : field.toUpperCase()}
                      </span>
                      <input
                        type={field === "email" ? "email" : "text"}
                        className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${errors[field] && touched[field] ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`}
                        value={form[field]}
                        onChange={onChange(field)}
                        onBlur={onBlur(field)}
                        placeholder={field === "name" ? "Ex: Salma" : field === "lastname" ? "Ex: Ben Ali" : field === "cin" ? "Ex: AA123456" : "votre.email@exemple.com"}
                        disabled={saving}
                      />
                      {errors[field] && touched[field] && <span className="text-xs text-red-600">{errors[field]}</span>}
                    </label>
                  ))}

                  <div className="md:col-span-2">
                    <div className="space-y-5">
                      <label className="block">
                        <span className="text-sm text-slate-700 font-medium">Banque</span>
                        <select
                          className={`mt-1 w-full rounded-md border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 ${(errors.banque && touched.banque) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`}
                          value={form.banque}
                          onChange={onChange("banque")}
                          onBlur={onBlur("banque")}
                        >
                          <option value="">Sélectionner votre banque</option>
                          {banks.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        {(errors.banque && touched.banque) && <span className="text-xs text-red-600">{errors.banque}</span>}
                      </label>

                      <div className="block">
                        <span className="text-sm text-slate-700 font-medium">Relevé d'Identité Bancaire (RIB)</span>
                        <p className="text-xs text-slate-500 mt-1 mb-2">Téléchargez une photo de votre RIB pour extraction automatique</p>

                        <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-brand-300 transition-colors">
                          <label className="cursor-pointer flex flex-col items-center">
                            <svg className="h-10 w-10 text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-slate-600">Cliquez pour télécharger une photo</span>
                            <span className="text-xs text-slate-400 mt-1">JPG, PNG ou WEBP (Max 10MB)</span>
                            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleRIBImageUpload} className="hidden" />
                          </label>
                        </div>

                        {ribImagePreview && (
                          <div className="mt-3 relative">
                            <img src={ribImagePreview} alt="RIB Preview" className="w-full h-48 object-cover rounded-lg border border-slate-200" />
                            <button
                              type="button"
                              onClick={() => {
                                setRibImagePreview(null);
                                setRibError("");
                                setRibSuccess("");
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {extractingRIB && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <span>Extraction du RIB en cours...</span>
                          </div>
                        )}

                        {ribSuccess && <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">{ribSuccess}</div>}
                        {ribError && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">{ribError}</div>}

                        <div className="mt-3">
                          <input
                            type="text"
                            className={`w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.rib && touched.rib) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`}
                            value={form.rib ? formatRIB(form.rib) : ""}
                            onChange={onChange("rib")}
                            onBlur={onBlur("rib")}
                            placeholder="20 chiffres du RIB"
                            maxLength="24"
                          />
                          {(errors.rib && touched.rib) && <span className="text-xs text-red-600">{errors.rib}</span>}
                          <p className="text-xs text-slate-500 mt-1">Vous pouvez aussi saisir manuellement le RIB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "securite" && (
                <label className="block mt-3">
                  <span className="text-sm text-slate-700">Nouveau mot de passe</span>
                  <div className="relative mt-1">
                    <input
                      type={showPwd ? "text" : "password"}
                      className="w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 border-slate-200 focus:ring-brand-300"
                      value={form.password || ""}
                      onChange={onChange("password")}
                      placeholder="••••••••"
                      disabled={saving}
                    />
                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500" disabled={saving}>
                      {showPwd ? "Masquer" : "Afficher"}
                    </button>
                  </div>
                </label>
              )}

              <div className="mt-6 border-t border-white/60 pt-5 flex justify-end gap-3">
                <button type="button" onClick={handleCancel} disabled={saving} className="rounded-md border border-slate-200 bg-white/80 hover:bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-50">
                  Annuler
                </button>
                <button type="submit" disabled={!canSave || saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed">
                  {saving && (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
