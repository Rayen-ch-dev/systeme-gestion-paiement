import React, { useMemo, useState, useEffect } from "react";
import { emailRegex } from "../utils/data";
import { getProfileComptable, updateProfileComptable } from "../api";
import { jwtDecode } from "jwt-decode";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    cin: "",
    email: "",
  });
  const [userId, setUserId] = useState(null);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  const initials = `${(form.name || "U")[0] || ""}${(form.lastname || "")[0] || ""}`.toUpperCase();

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onBlur = (key) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  // ✅ Validation logic
  const validate = useMemo(
    () => (data) => {
      const e = {};
      if (!data.name.trim()) e.name = "Prénom requis";
      if (!data.lastname.trim()) e.lastname = "Nom requis";
      if (!data.cin.trim() || !/^[A-Z0-9]{5,15}$/i.test(data.cin))
        e.cin = "CIN invalide";
      if (!emailRegex.test(data.email)) e.email = "Email invalide";
      return e;
    },
    []
  );

  useEffect(() => {
    setErrors(validate(form));
  }, [form, validate]);

  // ✅ Decode token once and extract userId
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      console.log("🔹 Token décodé :", decoded);
      setUserId(decoded.id || decoded._id); // handle both id or _id
    } catch (err) {
      console.error("❌ Token invalide :", err);
    }
  }, []);

  // ✅ Load profile when userId is ready
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const p = await getProfileComptable(userId);
        console.log("🔹 Réponse profil :", p);

      if (p.ok) {
        setForm((s) => ({
          ...s,
          name: p.user.user.name || "",
          lastname: p.user.user.lastname || "",
          cin: p.user.user.cin || "",
          email: p.user.user.email || "",
        }));
      } else {
        console.error("Erreur de chargement du profil :", p.error);
      }
      } catch (err) {
        console.error("❌ Erreur lors du chargement du profil :", err);
      }
    })();
  }, [userId]);

  const canSave = Object.keys(errors).length === 0;

  // ✅ Submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    const eMap = validate(form);
    setErrors(eMap);
    setTouched({
      name: true,
      lastname: true,
      cin: true,
      email: true,
    });

    if (Object.keys(eMap).length > 0) return;

    setSaving(true);
    try {
      const result = await updateProfileComptable({ ...form, id: userId });
      console.log("🔹 Résultat mise à jour :", result);

      if (result.ok) {
        setSaved(true);
        console.log("✅ Profil mis à jour :", result.profile || result);
      } else {
        console.error("❌ Erreur de mise à jour :", result.error || result);
      }
    } catch (err) {
      console.error("❌ Erreur inattendue :", err);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
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
                  <h1 className="text-xl font-semibold text-slate-900">
                    Profil
                  </h1>
                  <div className="text-xs text-slate-500">
                    Gérer vos informations de compte
                  </div>
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
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${
                    activeTab === "profil"
                      ? "bg-white text-slate-900"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Profil
                </button>
                 <button
                 disabled
                  type="button"
                  onClick={() => setActiveTab("securite")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${
                    activeTab === "securite"
                      ? "bg-white text-slate-900"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  
                </button> 
              
              </nav>
            </div>

            <form onSubmit={onSubmit} className="p-2">
              {activeTab === "profil" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["name", "lastname", "cin", "email"].map((field) => (
                    <label key={field} className="block">
                      <span className="text-sm text-slate-700 capitalize">
                        {field === "name"
                          ? "Prénom"
                          : field === "lastname"
                          ? "Nom"
                          : field.toUpperCase()}
                      </span>
                      <input
                        type={field === "email" ? "email" : "text"}
                        className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          errors[field] && touched[field]
                            ? "border-red-300 focus:ring-red-300"
                            : "border-slate-200 focus:ring-brand-300"
                        }`}
                        value={form[field]}
                        onChange={onChange(field)}
                        onBlur={onBlur(field)}
                        placeholder={
                          field === "name"
                            ? "Ex: Salma"
                            : field === "lastname"
                            ? "Ex: Ben Ali"
                            : field === "cin"
                            ? "Ex: AA123456"
                            : "votre.email@exemple.com"
                        }
                      />
                      {errors[field] && touched[field] && (
                        <span className="text-xs text-red-600">
                          {errors[field]}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
{activeTab === "securite" && (
                <label className="block mt-3">
                  <span className="text-sm text-slate-700">
                    Nouveau mot de passe
                  </span>
                  <div className="relative mt-1">
                    <input
                      type={showPwd ? "text" : "password"}
                      className="w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 border-slate-200 focus:ring-brand-300"
                      value={form.password}
                      onChange={onChange("password")}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500"
                    >
                      {showPwd ? "Masquer" : "Afficher"}
                    </button>
                  </div>
                </label>
              )} 
              

              <div className="mt-6 border-t border-white/60 pt-5 flex justify-end gap-3">
                <a
                  href="/AdminDashboard"
                  className="rounded-md border border-slate-200 bg-white/80 hover:bg-white px-4 py-2 text-sm text-slate-700"
                >
                  Annuler
                </a>
                <button
                  type="submit"
                  disabled={!canSave || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {saving && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
