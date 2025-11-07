import React, { useState } from "react";
// using direct navigation instead of react-router navigate for a simple redirect

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // 🟢 for success message
  const [error, setError] = useState(""); // 🟡 optional for errors

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    console.log("Reset link sent to:", email);

    // 🟢 Show success message
    setMessage(`Un lien de vérification a été envoyé à ${email}.`);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Réinitialiser le mot de passe
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Entrez votre adresse email pour recevoir le code de réinitialisation.
          </p>

          {/* 🟢 Success or error message */}
          {message && (
            <p className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-center">
              {message}
            </p>
          )}
          {error && (
            <p className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Adresse email</label>
              <input
                type="email"
                placeholder="votre.nom@institution.tld"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Envoyer le code de réinitialisation
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            <a href="/login" className="text-blue-600 hover:underline">
              Retour à la connexion
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
