import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { sendResetPasswordLink } from "../api/index.js";

export default function ForgotPassword() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // 🟢 for success message
  const [error, setError] = useState(""); // 🟡 optional for errors
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      // 👇 Call your API
      const result = await sendResetPasswordLink(email);

      if (result.ok) {
        setMessage(result.message); // show success
        // Optional: Redirect to login after success
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(result.error); // show error message
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle back to login
  const handleBackToLogin = () => {
    navigate("/login");
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
            Entrez votre adresse email pour recevoir le lien de réinitialisation.
          </p>

          {/* 🟢 Success or error message */}
          {message && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-center">
              {message}
              <div className="text-sm mt-1">
                Redirection vers la page de connexion...
              </div>
            </div>
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
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            <button
              onClick={handleBackToLogin}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}