import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { emailRegex } from "../utils/data";
import { getProfile, updateProfile } from "../api";
import { jwtDecode } from "jwt-decode";
import { extractRIBFromImage, validateRIB, formatRIB } from "../utils/ribExtractor";

export default function ProfilePage() {
  const navigate = useNavigate();
  
  const roleFromStorage =
    typeof window !== "undefined"
      ? localStorage.getItem("role") || "Formateur"
      : "Formateur";

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    cin: "",
    email: "",
    password: "",
    specialite: "",
    fonction: "",
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
  
  // États pour l'extraction RIB
  const [extractingRIB, setExtractingRIB] = useState(false);
  const [ribError, setRibError] = useState("");
  const [ribSuccess, setRibSuccess] = useState("");
  const [ribImagePreview, setRibImagePreview] = useState(null);

  const banks = useMemo(() => [
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
    "Banque de Financement des Petites et Moyennes Entreprises (BFPME)"
  ], []);

  const initials = `${(form.name || "U").slice(0, 1)}${(form.lastname || "").slice(0, 1)}`.toUpperCase();

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const validate = useMemo(
    () => (data) => {
      const e = {};
      if (!data.name.trim()) e.name = "Prénom requis";
      if (!data.lastname.trim()) e.lastname = "Nom requis";
      if (!data.cin.trim() || !/^[A-Z0-9]{5,15}$/i.test(data.cin)) e.cin = "CIN invalide";
      if (!emailRegex.test(data.email)) e.email = "Email invalide";
      if (!data.password || data.password.length < 6)
        e.password = "Mot de passe min. 6 caractères";
      if (roleFromStorage === "Formateur" && !data.specialite.trim())
        e.specialite = "Spécialité requise";
      if (roleFromStorage === "Coordinateur" && !data.fonction.trim())
        e.fonction = "Fonction requise";
      if (data.rib && !validateRIB(data.rib))
        e.rib = "RIB invalide (20 chiffres requis)";
      return e;
    },
    [roleFromStorage]
  );

  useEffect(() => {
    setErrors(validate(form));
  }, [form, validate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      console.log("Token décodé :", decoded);
      setUserId(decoded.id);
    } catch (err) {
      console.error("Token invalide :", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const p = await getProfile(userId);
      if (p.ok && p.user) {
        setForm((s) => ({
          ...s,
          name: p.user.name || "",
          lastname: p.user.lastname || "",
          cin: p.user.cin || "",
          email: p.user.email || "",
          password: p.user.password || "",
          specialite: p.user.specialite || "",
          fonction: p.user.fonction || "",
          banque: p.user.banque || "",
          rib: p.user.rib || "",
        }));
      } else {
        console.error("Erreur de chargement du profil :", p.error);
      }
    })();
  }, [userId]);

  // Gestion de l'upload d'image RIB
  const handleRIBImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Afficher l'aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setRibImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Extraire le RIB
    setExtractingRIB(true);
    setRibError("");
    setRibSuccess("");

    try {
      const result = await extractRIBFromImage(file);
      
      if (result.success) {
        setForm((s) => ({ ...s, rib: result.rib }));
        setRibSuccess(`RIB extrait avec succès : ${formatRIB(result.rib)}`);
        setTimeout(() => setRibSuccess(""), 5000);
      } else {
        setRibError(result.error || "Impossible d'extraire le RIB");
      }
    } catch (err) {
      console.error("Erreur extraction RIB:", err);
      setRibError("Erreur lors de l'extraction du RIB");
    } finally {
      setExtractingRIB(false);
    }
  };

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
      password: true,
      specialite: true,
      fonction: true,
      banque: true,
      rib: true,
    });

    if (Object.keys(eMap).length > 0) return;

    setSaving(true);

    try {
      const result = await updateProfile({ ...form, id: userId });

      if (result.ok) {
        setSaved(true);
        console.log("Profil mis à jour avec succès :", result.profile);
        navigate("/dashboard");
      } else {
        console.error("Erreur lors de la mise à jour :", result.error);
      }
    } catch (err) {
      console.error("Erreur inattendue :", err);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-slate-50 overflow-hidden">
      <div className="w-full max-w-2xl relative">
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-[var(--shadow-soft)] border border-white/70">
          <div className="p-7 pb-3">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold ring-4 ring-white/60 shadow-sm">{initials}</div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Profil</h1>
                  <div className="text-xs text-slate-500">Gérez vos informations de compte</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 text-brand-700 px-3 py-1 text-[11px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                <span>{roleFromStorage}</span>
              </div>
            </div>

            {saved && (
              <div className="fixed top-5 right-5 z-50 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm shadow-sm">Profil enregistré.</div>
            )}

            <div className="border-b border-white/60">
              <nav className="flex gap-2 text-sm">
                <button type="button" onClick={() => setActiveTab("profil")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "profil" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7a4 4 0 110-8 4 4 0 010 8z"/></svg>
                  Profil
                </button>
                <button type="button" onClick={() => setActiveTab("bancaire")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "bancaire" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/><line x1="2" y1="10" x2="22" y2="10" strokeWidth="2"/></svg>
                  Informations bancaires
                </button>
              </nav>
            </div>
            
            <form onSubmit={onSubmit} className="p-7 pt-5" >
              {activeTab === "profil" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-slate-700">Prénom</span>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      </span>
                      <input className={`w-full rounded-md border pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.name && touched.name) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.name} onChange={onChange("name")} onBlur={onBlur("name")} placeholder="Ex: Salma" />
                    </div>
                    {(errors.name && touched.name) && <span className="text-xs text-red-600">{errors.name}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">Nom</span>
                    <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.lastname && touched.lastname) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.lastname} onChange={onChange("lastname")} onBlur={onBlur("lastname")} placeholder="Ex: Ben Ali" />
                    {(errors.lastname && touched.lastname) && <span className="text-xs text-red-600">{errors.lastname}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">CIN</span>
                    <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.cin && touched.cin) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.cin} onChange={onChange("cin")} onBlur={onBlur("cin")} placeholder="Ex: AA123456" />
                    {(errors.cin && touched.cin) && <span className="text-xs text-red-600">{errors.cin}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">Email</span>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7"/></svg>
                      </span>
                      <input type="email" className={`w-full rounded-md border pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.email && touched.email) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.email} onChange={onChange("email")} onBlur={onBlur("email")} placeholder="votre.email@exemple.com" />
                    </div>
                    {(errors.email && touched.email) && <span className="text-xs text-red-600">{errors.email}</span>}
                  </label>
                </div>
              ) : activeTab === "bancaire" ? (
                <div className="space-y-5">
                  {/* Sélection de la banque */}
                  <label className="block">
                    <span className="text-sm text-slate-700 font-medium">Banque</span>
                    <select
                      className={`mt-1 w-full rounded-md border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 ${
                        (errors.banque && touched.banque)
                          ? "border-red-300 focus:ring-red-300"
                          : "border-slate-200 focus:ring-brand-300"
                      }`}
                      value={form.banque}
                      onChange={onChange("banque")}
                      onBlur={onBlur("banque")}
                    >
                      <option value="">Sélectionner votre banque</option>
                      {banks.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {(errors.banque && touched.banque) && <span className="text-xs text-red-600">{errors.banque}</span>}
                  </label>

                  {/* Extraction RIB par image */}
                  <div className="block">
                    <span className="text-sm text-slate-700 font-medium">Relevé d'Identité Bancaire (RIB)</span>
                    <p className="text-xs text-slate-500 mt-1 mb-2">Téléchargez une photo de votre RIB pour extraction automatique</p>
                    
                    {/* Zone d'upload */}
                    <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-brand-300 transition-colors">
                      <label className="cursor-pointer flex flex-col items-center">
                        <svg className="h-10 w-10 text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span className="text-sm text-slate-600">Cliquez pour télécharger une photo</span>
                        <span className="text-xs text-slate-400 mt-1">JPG, PNG ou WEBP (Max 10MB)</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleRIBImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Aperçu de l'image */}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* État d'extraction */}
                    {extractingRIB && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Extraction du RIB en cours...</span>
                      </div>
                    )}

                    {/* Messages de succès/erreur */}
                    {ribSuccess && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
                        {ribSuccess}
                      </div>
                    )}
                    {ribError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                        {ribError}
                      </div>
                    )}

                    {/* Champ RIB (lecture seule ou manuel) */}
                    <div className="mt-3">
                      <input
                      disabled={true}
                        type="text"
                        className={`w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          (errors.rib && touched.rib)
                            ? "border-red-300 focus:ring-red-300"
                            : "border-slate-200 focus:ring-brand-300"
                        }`}
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
              ) : null}

              <div className="mt-6 border-t border-white/60 pt-5">
                <div className="flex items-center gap-3 justify-end">
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white/80 hover:bg-white px-4 py-2 text-sm text-slate-700"
                  >
                    Annuler
                  </button>
                  <button type="submit" disabled={!canSave || saving || extractingRIB} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400">
                    {saving ? (
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : null}
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}