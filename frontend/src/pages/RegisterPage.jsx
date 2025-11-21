import React, { useEffect, useMemo, useState } from "react";
import { emailRegex, cinRegex } from "../utils/data";
import { auth } from "../api";
import emailjs from "emailjs-com";


export default function RegisterPage() {
  const [role, setRole] = useState("formateur"); // "formateur" | "coordinateur"
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cin: "",
    password: "",
    confirmPassword: "",
    bank: "",
    fonction: "", // only for coordinateur
    specialite: "", // only for formateur
  });
  const [errors, setErrors] = useState({});
  const [dup, setDup] = useState({ email: false, cin: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    cin: false,
    password: false,
    confirmPassword: false,
    bank: false,
    fonction: false,
    specialite: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

const banks = useMemo(() => [
  "BIAT (Banque Internationale Arabe de Tunisie)",
  "Amen Bank",
  "ATB (Arab Tunisian Bank)",
  "BH Bank (Banque de l’Habitat)",
  "BNA (Banque Nationale Agricole)",
  "STB (Société Tunisienne de Banque)",
  "UIB (Union Internationale de Banques)",
  "UBCI (Union Bancaire pour le Commerce et l’Industrie)",
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


  const validate = (data) => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "Prénom requis";
    if (!data.lastName.trim()) e.lastName = "Nom requis";
    if (!emailRegex.test(data.email)) e.email = "Email invalide";
    if (!cinRegex.test(data.cin)) e.cin = "CIN invalide";
    if (!data.password || data.password.length < 6) e.password = "Mot de passe trop court";
    if (!data.confirmPassword) e.confirmPassword = "Confirmation requise";
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) e.confirmPassword = "Les mots de passe ne correspondent pas";
    if (!data.bank) e.bank = "Banque requise";
    if (role === "coordinateur" && !data.fonction.trim()) e.fonction = "Fonction requise";
    if (role === "formateur" && !data.specialite.trim()) e.specialite = "Spécialité requise";
    return e;
  };

  // real-time format validation
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  // mock duplicate checks in real-time
  // Duplicate checks now handled by backend on submit

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const onBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const canSubmit = useMemo(() => {
    const hasErrors = Object.keys(errors).length > 0;
    return !hasErrors;
  }, [errors]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const eMap = validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;

    setSubmitting(true);
    try {
      if(role === "formateur"){
      var payload = {
        name: form.firstName,
        lastname: form.lastName,
        cin: form.cin,
        email: form.email,
        password: form.password,
        role: role, // "formateur" | "coordinateur"
        banque: form.bank,
        specialite: form.specialite,
      };
      }else if(role === "coordinateur"){
      var payload = {
        name: form.firstName,
        lastname: form.lastName,
        cin: form.cin,
        email: form.email,
        password: form.password,
        role: role, // "formateur" | "coordinateur"
        banque: form.bank,
        fonction: form.fonction,
      };}

      const res = await auth.register(payload);
      if (!res.ok) {
        console.error(res.error || "Registration failed");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  //send email form
const sendEmail = () => {
  emailjs
    .send(
      "service_kd8x74c",
      "template_acz6p9d",
      {
        to_name: `${form.firstName} ${form.lastName}`,  // or just form.firstName
        role: role,
        // add more variables here if your template needs them
      },
      "jkbntAAOriqCFbpuy"  // your EmailJS user ID
    )
    .then(() => {
      console.log("Email sent successfully");
    })
    .catch((err) => {
      console.error("Email sending failed:", err);
    });
};



  if (submitted) {
    sendEmail()
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl p-7 shadow-[var(--shadow-soft)] border border-slate-100 max-w-lg w-full text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-lg font-semibold text-slate-900">
            Inscription envoyée
          </h1>

          <p className="mt-1 text-slate-600 text-sm">
            Votre compte est en statut{" "}
            <span className="font-medium">en attente</span>. Une confirmation
            vous a été envoyée par email. L'accès sera activé après approbation
            administrative.
          </p>

          <div className="mt-4">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium transition"
            >
              Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    );
  }

 return (
  submitted ? (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-7 shadow-[var(--shadow-soft)] border border-slate-100 max-w-lg w-full text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-lg font-semibold text-slate-900">Inscription envoyée</h1>

        <p className="mt-1 text-slate-600 text-sm">
          Votre compte est en statut <span className="font-medium">en attente</span>. Une confirmation
          vous a été envoyée par email. L'accès sera activé après approbation administrative.
        </p>

        <div className="mt-4">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium transition"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl p-7 shadow-[var(--shadow-soft)] border border-slate-100">

          {/* Titre */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">Créer un compte</h1>
            <p className="text-sm text-slate-600">Sélectionnez votre type de compte et renseignez vos informations.</p>
          </div>

          {/* Choix rôle */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("formateur")}
              className={`h-10 rounded-md border text-sm font-medium transition ${
                role === "formateur"
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Formateur
            </button>

            <button
              type="button"
              onClick={() => setRole("coordinateur")}
              className={`h-10 rounded-md border text-sm font-medium transition ${
                role === "coordinateur"
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Coordinateur
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Fonction / spécialité */}
            {role === "coordinateur" ? (
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-700">Fonction</span>
                <input
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    (errors.fonction && (touched.fonction || submitAttempted))
                      ? "border-red-300 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-300"
                  }`}
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
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    (errors.specialite && (touched.specialite || submitAttempted))
                      ? "border-red-300 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-300"
                  }`}
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

            {/* Prénom */}
            <label className="block">
              <span className="text-sm text-slate-700">Prénom</span>
              <input
                className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  (errors.firstName && (touched.firstName || submitAttempted))
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-brand-300"
                }`}
                value={form.firstName}
                onChange={onChange("firstName")}
                onBlur={onBlur("firstName")}
                placeholder="Ex: Salma"
              />
              {(errors.firstName && (touched.firstName || submitAttempted)) ? (
                <span className="text-xs text-red-600">{errors.firstName}</span>
              ) : null}
            </label>

            {/* Nom */}
            <label className="block">
              <span className="text-sm text-slate-700">Nom</span>
              <input
                className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  (errors.lastName && (touched.lastName || submitAttempted))
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-brand-300"
                }`}
                value={form.lastName}
                onChange={onChange("lastName")}
                onBlur={onBlur("lastName")}
                placeholder="Ex: Ben Ali"
              />
              {(errors.lastName && (touched.lastName || submitAttempted)) ? (
                <span className="text-xs text-red-600">{errors.lastName}</span>
              ) : null}
            </label>

            {/* Email */}
            <label className="block md:col-span-2">
              <span className="text-sm text-slate-700">Email</span>
              <input
                type="email"
                className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  (errors.email && (touched.email || submitAttempted))
                    ? "border-red-300 focus:ring-red-300"
                    : "border-slate-200 focus:ring-brand-300"
                }`}
                value={form.email}
                onChange={onChange("email")}
                onBlur={onBlur("email")}
                placeholder="votre.email@exemple.com"
              />
              {(dup.email && (touched.email || submitAttempted)) ? (
                <span className="text-xs text-amber-600">Cet email existe déjà</span>
              ) : ((errors.email && (touched.email || submitAttempted)) ? (
                <span className="text-xs text-red-600">{errors.email}</span>
              ) : null)}
            </label>

            {/* CIN + Banque (ligne groupée) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">

              {/* CIN */}
              <label className="block">
                <span className="text-sm text-slate-700">CIN</span>
                <input
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    (errors.cin && (touched.cin || submitAttempted))
                      ? "border-red-300 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-300"
                  }`}
                  value={form.cin}
                  onChange={onChange("cin")}
                  onBlur={onBlur("cin")}
                  placeholder="Ex: AA123456"
                />
                {(dup.cin && (touched.cin || submitAttempted)) ? (
                  <span className="text-xs text-amber-600">Ce CIN existe déjà</span>
                ) : ((errors.cin && (touched.cin || submitAttempted)) ? (
                  <span className="text-xs text-red-600">{errors.cin}</span>
                ) : null)}
              </label>

              {/* Banque */}
              <label className="block">
                <span className="text-sm text-slate-700">Banque</span>
                <select
                  className={`mt-1 w-full rounded-md border px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 ${
                    (errors.bank && (touched.bank || submitAttempted))
                      ? "border-red-300 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-300"
                  }`}
                  value={form.bank}
                  onChange={onChange("bank")}
                  onBlur={onBlur("bank")}
                >
                  <option value="">Sélectionner</option>
                  {banks.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {(errors.bank && (touched.bank || submitAttempted)) ? (
                  <span className="text-xs text-red-600">{errors.bank}</span>
                ) : null}
              </label>

            </div>

            {/* Mot de passe + Confirmation (ligne groupée) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">

              {/* Mot de passe */}
              <label className="block">
                <span className="text-sm text-slate-700">Mot de passe</span>
                <input
                  type="password"
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    (errors.password && (touched.password || submitAttempted))
                      ? "border-red-300 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-300"
                  }`}
                  value={form.password}
                  onChange={onChange("password")}
                  onBlur={onBlur("password")}
                  placeholder="••••••"
                />
                {(errors.password && (touched.password || submitAttempted)) ? (
                  <span className="text-xs text-red-600">{errors.password}</span>
                ) : null}
              </label>

              {/* Confirmer */}
              <label className="block">
                <span className="text-sm text-slate-700">Confirmer le mot de passe</span>
                <input
                  type="password"
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    (errors.confirmPassword && (touched.confirmPassword || submitAttempted))
                      ? "border-red-300 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-300"
                  }`}
                  value={form.confirmPassword}
                  onChange={onChange("confirmPassword")}
                  onBlur={onBlur("confirmPassword")}
                  placeholder="••••••"
                />
                {(errors.confirmPassword && (touched.confirmPassword || submitAttempted)) ? (
                  <span className="text-xs text-red-600">{errors.confirmPassword}</span>
                ) : null}
              </label>

            </div>

            {/* Bouton */}
            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {submitting ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : null}
                Envoyer ma demande d'inscription
              </button>

              <div className="mt-3 text-xs text-blue-500 text-center">
                En envoyant, votre compte sera placé en statut <span className="font-medium">en attente</span> jusqu'à validation par le responsable de paie.
              </div>
            </div>

          </form>

          {/* Déjà inscrit */}
          <div className="mt-5 text-xs text-slate-500 text-center">
            Vous avez déjà un compte ?{" "}
            <a className="text-brand-600 hover:text-brand-700" href="/">Se connecter</a>
          </div>

        </div>
      </div>
    </div>
  )
);
}