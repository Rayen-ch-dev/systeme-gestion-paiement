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

    // 🔎 Validation de base
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
      // 🌐 Envoi au backend
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
      console.log(data);

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création du compte.");
      }

      setMessage(`✅ Compte créé avec succès pour ${name} ${lastName}.`);
      setFormData({ name: "", lastName: "", email: "", cin: "", password: "" });
    } catch (err) {
      setError( "verifier vos informations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Créer un compte Responsable de paie
        </h2>

        {/* Messages */}
        {error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4 text-center">
            {error}
          </p>
        )}
        {message && (
          <p className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-center">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nom"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Prénom"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Adresse Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">CIN</label>
            <input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              placeholder="CIN"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="md:col-span-2 flex justify-around mt-4 gap-3">
            <a
              href="/SuperAdminDashboard"
              className="w-1/2 text-center bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </a>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
