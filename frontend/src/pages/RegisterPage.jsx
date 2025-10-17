import React, { useEffect, useMemo, useState } from "react";

const mockExisting = [
  { email: "john.doe@example.com", cin: "AA123456", phone: "+33601020304" },
  { email: "jane.smith@example.com", cin: "BB987654", phone: "+33611223344" },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phoneRegex = /^(\+?\d{6,15}|0\d{8,14})$/;
const ribRegex = /^[0-9A-Z]{10,34}$/i; // IBAN/RIB simplified validation

export default function RegisterPage() {
  const [role, setRole] = useState("formateur"); // "formateur" | "coordinateur"
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cin: "",
    phone: "",
    address: "",
    bank: "",
    rib: "",
    fonction: "", // only for coordinateur
    specialite: "", // only for formateur
  });
  const [errors, setErrors] = useState({});
  const [dup, setDup] = useState({ email: false, cin: false, phone: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    cin: false,
    phone: false,
    address: false,
    bank: false,
    rib: false,
    fonction: false,
    specialite: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const banks = useMemo(() => [
    "Attijariwafa Bank",
    "Banque Populaire",
    "BMCE Bank of Africa",
    "CIH Bank",
    "Société Générale",
    "Crédit Agricole",
  ], []);

  const validate = (data) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "Prénom requis";
    if (!data.lastName.trim()) e.lastName = "Nom requis";
    if (!emailRegex.test(data.email)) e.email = "Email invalide";
    if (!data.cin || data.cin.length < 6) e.cin = "CIN invalide";
    if (!phoneRegex.test(data.phone)) e.phone = "Téléphone invalide";
    if (!data.address.trim()) e.address = "Adresse requise";
    if (!data.bank) e.bank = "Banque requise";
    if (!ribRegex.test(data.rib)) e.rib = "RIB/IBAN invalide";
    if (role === "coordinateur" && !data.fonction.trim()) e.fonction = "Fonction requise";
    if (role === "formateur" && !data.specialite.trim()) e.specialite = "Spécialité requise";
    return e;
  };

  // real-time format validation
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  // mock duplicate checks in real-time
  useEffect(() => {
    setDup({
      email: !!form.email && mockExisting.some((u) => u.email.toLowerCase() === form.email.toLowerCase()),
      cin: !!form.cin && mockExisting.some((u) => u.cin.toLowerCase() === form.cin.toLowerCase()),
      phone: !!form.phone && mockExisting.some((u) => u.phone === form.phone),
    });
  }, [form.email, form.cin, form.phone]);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const canSubmit = useMemo(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasDup = Object.values(dup).some(Boolean);
    return !hasErrors && !hasDup;
  }, [errors, dup]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const eMap = validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;
    if (Object.values(dup).some(Boolean)) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API
    setSubmitting(false);
    setSubmitted(true);

    // Simulate sending confirmation email and pending status
    // In a real app, backend sets status=pending and sends email.
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-7 shadow-[var(--shadow-soft)] border border-slate-100 max-w-lg w-full text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Inscription envoyée</h1>
          <p className="mt-1 text-slate-600 text-sm">Votre compte est en statut <span className="font-medium">en attente</span>. Une confirmation vous a été envoyée par email. L'accès sera activé après approbation administrative.</p>
          <div className="mt-4">
            <a href="/" className="inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium transition">Retour à la connexion</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl p-7 shadow-[var(--shadow-soft)] border border-slate-100">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">Créer un compte</h1>
            <p className="text-sm text-slate-600">Sélectionnez votre type de compte et renseignez vos informations.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole("formateur")} className={`h-10 rounded-md border text-sm font-medium transition ${role === "formateur" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>Formateur</button>
            <button type="button" onClick={() => setRole("coordinateur")} className={`h-10 rounded-md border text-sm font-medium transition ${role === "coordinateur" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>Coordinateur</button>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {role === "coordinateur" ? (
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Fonction</span>
                <input
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.fonction && (touched.fonction || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`}
                  value={form.fonction}
                  onChange={onChange("fonction")}
                  onBlur={onBlur("fonction")}
                  placeholder="Ex: Responsable coordination"
                />
                {(errors.fonction && (touched.fonction || submitAttempted)) ? (
                  <span className="text-xs text-red-600">{errors.fonction}</span>
                ) : null}
              </label>
            ) : (
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Spécialité</span>
                <input
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.specialite && (touched.specialite || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`}
                  value={form.specialite}
                  onChange={onChange("specialite")}
                  onBlur={onBlur("specialite")}
                  placeholder="Ex: Développement Web, Finance, RH..."
                />
                {(errors.specialite && (touched.specialite || submitAttempted)) ? (
                  <span className="text-xs text-red-600">{errors.specialite}</span>
                ) : null}
              </label>
            )}
            <label className="block">
              <span className="text-sm text-slate-700">Prénom</span>
              <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.firstName && (touched.firstName || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.firstName} onChange={onChange("firstName")} onBlur={onBlur("firstName")} placeholder="Ex: Salma" />
              {(errors.firstName && (touched.firstName || submitAttempted)) ? <span className="text-xs text-red-600">{errors.firstName}</span> : null}
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Nom</span>
              <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.lastName && (touched.lastName || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.lastName} onChange={onChange("lastName")} onBlur={onBlur("lastName")} placeholder="Ex: Ben Ali" />
              {(errors.lastName && (touched.lastName || submitAttempted)) ? <span className="text-xs text-red-600">{errors.lastName}</span> : null}
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Email</span>
              <input type="email" className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.email && (touched.email || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.email} onChange={onChange("email")} onBlur={onBlur("email")} placeholder="votre.email@exemple.com" />
              {(dup.email && (touched.email || submitAttempted)) ? <span className="text-xs text-amber-600">Cet email existe déjà</span> : ((errors.email && (touched.email || submitAttempted)) ? <span className="text-xs text-red-600">{errors.email}</span> : null)}
            </label>

            <label className="block">
              <span className="text-sm text-slate-700">CIN</span>
              <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.cin && (touched.cin || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.cin} onChange={onChange("cin")} onBlur={onBlur("cin")} placeholder="Ex: AA123456" />
              {(dup.cin && (touched.cin || submitAttempted)) ? <span className="text-xs text-amber-600">Ce CIN existe déjà</span> : ((errors.cin && (touched.cin || submitAttempted)) ? <span className="text-xs text-red-600">{errors.cin}</span> : null)}
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Téléphone</span>
              <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.phone && (touched.phone || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.phone} onChange={onChange("phone")} onBlur={onBlur("phone")} placeholder="Ex: +212612345678" />
              {(dup.phone && (touched.phone || submitAttempted)) ? <span className="text-xs text-amber-600">Ce téléphone existe déjà</span> : ((errors.phone && (touched.phone || submitAttempted)) ? <span className="text-xs text-red-600">{errors.phone}</span> : null)}
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Adresse</span>
              <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.address && (touched.address || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.address} onChange={onChange("address")} onBlur={onBlur("address")} placeholder="N°, Rue, Ville" />
              {(errors.address && (touched.address || submitAttempted)) ? <span className="text-xs text-red-600">{errors.address}</span> : null}
            </label>

            <label className="block">
              <span className="text-sm text-slate-700">Banque</span>
              <select className={`mt-1 w-full rounded-md border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 ${(errors.bank && (touched.bank || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.bank} onChange={onChange("bank")} onBlur={onBlur("bank")}> 
                <option value="">Sélectionner</option>
                {banks.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {(errors.bank && (touched.bank || submitAttempted)) ? <span className="text-xs text-red-600">{errors.bank}</span> : null}
            </label>

            <label className="block">
              <span className="text-sm text-slate-700">RIB / IBAN</span>
              <input className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${(errors.rib && (touched.rib || submitAttempted)) ? "border-red-300 focus:ring-red-300" : "border-slate-200 focus:ring-brand-300"}`} value={form.rib} onChange={onChange("rib")} onBlur={onBlur("rib")} placeholder="Ex: MA64 1234 5678 ..." />
              {(errors.rib && (touched.rib || submitAttempted)) ? <span className="text-xs text-red-600">{errors.rib}</span> : null}
            </label>

            <div className="md:col-span-2 mt-2">
              <button type="submit" disabled={!canSubmit || submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400">
                {submitting ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : null}
                Envoyer ma demande d'inscription
              </button>
              <div className="mt-3 text-xs text-slate-500 text-center">
                En envoyant, votre compte sera placé en statut <span className="font-medium">en attente</span> jusqu'à validation par le responsable de paie.
              </div>
            </div>
          </form>

          <div className="mt-5 text-xs text-slate-500 text-center">
            Vous avez déjà un compte ? <a className="text-brand-600 hover:text-brand-700" href="/">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  );
}
