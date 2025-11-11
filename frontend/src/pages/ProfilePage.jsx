import React, { useMemo, useState, useEffect } from "react";
import { emailRegex } from "../utils/data";
import { getProfile  } from "../api";

export default function ProfilePage() {
  const roleFromStorage = typeof window !== "undefined" ? (localStorage.getItem("role") || "Formateur") : "Formateur";
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    cin: "",
    email: "",
    password: "",
    specialite: "",
    fonction: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [activeTab, setActiveTab] = useState("profil"); // profil | securite | metier
  const initials = `${(form.name || 'U').slice(0,1)}${(form.lastname || '').slice(0,1)}`.toUpperCase();

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const validate = useMemo(() => (data) => {
    const e = {};
    if (!data.name.trim()) e.name = "Prénom requis";
    if (!data.lastname.trim()) e.lastname = "Nom requis";
    if (!data.cin.trim() || !/^[A-Z0-9]{5,15}$/i.test(data.cin)) e.cin = "CIN invalide";
    if (!emailRegex.test(data.email)) e.email = "Email invalide";
    if (!data.password || data.password.length < 6) e.password = "Mot de passe min. 6 caractères";
    if (roleFromStorage === "Formateur" && !data.specialite.trim()) e.specialite = "Spécialité requise";
    if (roleFromStorage === "Coordinateur" && !data.fonction.trim()) e.fonction = "Fonction requise";
    return e;
  }, [roleFromStorage]);

  useEffect(() => {
    setErrors(validate(form));
  }, [form, validate]);

useEffect(() => {
  (async () => {
    const p = await getProfile("69134aae7a7a24bda6c59a63");

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
}, []);


  const canSave = Object.keys(errors).length === 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    const eMap = validate(form);
    setErrors(eMap);
    setTouched({ ame: true, lastname: true, cin: true, email: true, password: true, specialite: true, fonction: true });
    if (Object.keys(eMap).length > 0) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    const result = await profileApi.updateProfile({ ...form });
    if (!result.ok) {
      // keep UI unchanged; optionally we could surface an error later
    }
    setTimeout(() => setSaved(false), 2000);
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

            {saved ? (
              <div className="fixed top-5 right-5 z-50 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm shadow-sm">Profil enregistré.</div>
            ) : null}

            <div className="border-b border-white/60">
              <nav className="flex gap-2 text-sm">
                <button type="button" onClick={() => setActiveTab("profil")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "profil" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7a4 4 0 110-8 4 4 0 010 8z"/></svg>
                  Profil
                </button>
                <button type="button" onClick={() => setActiveTab("securite")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "securite" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 20a6.5 6.5 0 0113 0"/></svg>
                  Sécurité
                </button>
                <button type="button" onClick={() => setActiveTab("metier")} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${activeTab === "metier" ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-800"}`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6"/></svg>
                  Métier
                </button>
              </nav>
            </div>
            <form onSubmit={onSubmit} className="p-7 pt-5">
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
                    {(errors.name && touched.name) ? <span className="text-xs text-red-600">{errors.name}</span> : null}
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">Nom</span>
                    <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.lastname && touched.lastname) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.lastname} onChange={onChange("lastname")} onBlur={onBlur("lastname")} placeholder="Ex: Ben Ali" />
                    {(errors.lastname && touched.lastname) ? <span className="text-xs text-red-600">{errors.lastname}</span> : null}
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">CIN</span>
                    <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.cin && touched.cin) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.cin} onChange={onChange("cin")} onBlur={onBlur("cin")} placeholder="Ex: AA123456" />
                    {(errors.cin && touched.cin) ? <span className="text-xs text-red-600">{errors.cin}</span> : null}
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-700">Email</span>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7"/></svg>
                      </span>
                      <input type="email" className={`w-full rounded-md border pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.email && touched.email) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.email} onChange={onChange("email")} onBlur={onBlur("email")} placeholder="votre.email@exemple.com" />
                    </div>
                    {(errors.email && touched.email) ? <span className="text-xs text-red-600">{errors.email}</span> : null}
                  </label>
                </div>
              ) : null}

              {activeTab === "securite" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block md:col-span-2">
                    <span className="text-sm text-slate-700">Mot de passe</span>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 20a6.5 6.5 0 0113 0"/></svg>
                      </span>
                      <input type={showPwd ? "text" : "password"} className={`w-full rounded-md border pr-20 pl-9 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.password && touched.password) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.password} onChange={onChange("password")} onBlur={onBlur("password")} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute inset-y-0 right-0 my-1 mr-1 rounded-md border border-slate-200 bg-white/80 hover:bg-white px-2 text-xs text-slate-600">
                        {showPwd ? "Masquer" : "Afficher"}
                      </button>
                    </div>
                    {(errors.password && touched.password) ? <span className="text-xs text-red-600">{errors.password}</span> : null}
                  </label>
                </div>
              ) : null}

              {activeTab === "metier" ? (
                <div className="grid grid-cols-1 gap-4">
                  {roleFromStorage === "Formateur" ? (
                    <label className="block">
                      <span className="text-sm text-slate-700">Spécialité</span>
                      <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.specialite && touched.specialite) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.specialite} onChange={onChange("specialite")} onBlur={onBlur("specialite")} placeholder="Ex: React, Data, Réseaux..." />
                      {(errors.specialite && touched.specialite) ? <span className="text-xs text-red-600">{errors.specialite}</span> : null}
                    </label>
                  ) : null}

                  {roleFromStorage === "Coordinateur" ? (
                    <label className="block">
                      <span className="text-sm text-slate-700">Fonction</span>
                      <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.fonction && touched.fonction) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.fonction} onChange={onChange("fonction")} onBlur={onBlur("fonction")} placeholder="Ex: Coordination pédagogique" />
                      {(errors.fonction && touched.fonction) ? <span className="text-xs text-red-600">{errors.fonction}</span> : null}
                    </label>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 border-t border-white/60 pt-5">
                <div className="flex items-center gap-3 justify-end">
                  <a href="/" className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white/80 hover:bg-white px-4 py-2 text-sm text-slate-700">Annuler</a>
                  <button type="submit" disabled={!canSave || saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400">
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

