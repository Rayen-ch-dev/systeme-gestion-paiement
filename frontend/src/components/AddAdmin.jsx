import React, { useState } from "react";

export default function AddAdmin() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    cin: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, lastName, email, cin, password } = formData;

    if (!name || !lastName || !email || !cin || !password) {
      setError("Veuillez remplir tous les champs.");
      setMessage("");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Veuillez entrer un email valide.");
      setMessage("");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setMessage("");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/comptable/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastname: lastName,
          email,
          cin,
          password,
          role: "comptable",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création du compte.");
      }

      setMessage(`✅ Compte créé avec succès pour ${name} ${lastName}.`);
      setFormData({ name: "", lastName: "", email: "", cin: "", password: "" });
    } catch (err) {
      setError("Vérifier vos informations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen p-6 bg-slate-50 overflow-hidden flex justify-center items-start pt-16">

      {/* Soft Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-32 w-72 h-72 bg-brand-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-slate-400/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Form Card */}
      <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[var(--shadow-soft)] rounded-2xl p-8">

        <h2 className="text-2xl font-semibold text-slate-900 text-center mb-6">
          Créer un compte Responsable de paie
        </h2>

        {/* Alerts */}
        {error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded-xl mb-4 text-center border border-red-200 shadow-sm">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl mb-4 text-center border border-emerald-200 shadow-sm">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-slate-700 mb-1 font-medium">Nom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-medium">Prénom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 mb-1 font-medium">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              className="w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-medium">CIN</label>
            <input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              placeholder="CIN"
              className="w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 bg-white/80 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 mt-5 flex gap-4">
            <a
              href="/SuperAdminDashboard"
              className="w-1/2 text-center py-3 rounded-xl bg-white/70 border border-slate-300 text-slate-700 font-medium shadow-sm hover:bg-white transition"
            >
              Annuler
            </a>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
