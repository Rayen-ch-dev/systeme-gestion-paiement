import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  if (newPassword !== confirmPassword) {
    setError("Les mots de passe ne correspondent pas.");
    return;
  }

  if (newPassword.length < 6) {
    setError("Le mot de passe doit contenir au moins 6 caractères.");
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour changer le mot de passe.");
      setLoading(false);
      return;
    }
   const response = await fetch("http://localhost:5000/api/comptable/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors du changement de mot de passe");
    }
    
    localStorage.setItem("token", data.token);

    setMessage("Mot de passe changé avec succès !");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      navigate("/AdminDashboard"); 
    }, 2000);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  const handleBack = () => {
    navigate("/logincomptable");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Changer le mot de passe
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Veuillez saisir un nouveau mot de passe.
          </p>

          {message && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-center">
              {message}
              <div className="text-sm mt-1">
                Redirection vers le tableau de bord...
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
              <label className="block text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mise à jour...
                </span>
              ) : (
                "Changer le mot de passe"
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:underline focus:outline-none"
              disabled={loading}
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
