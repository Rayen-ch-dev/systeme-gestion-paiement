import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Added useNavigate

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Initialize useNavigate
  
  const token = searchParams.get("token")?.trim();
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  console.log("Params:", { token, id, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧠 Basic validation
    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/password/resetPassword/${type}/${id}/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmPassword }),
        },
      );
      console.log(res)

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Votre mot de passe a été réinitialisé avec succès !");
        // Redirect to login after short delay using navigate
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        setError(data.message || "Erreur lors de la réinitialisation du mot de passe.");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Réinitialiser votre mot de passe
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Entrez un nouveau mot de passe sécurisé.
          </p>

          {error && (
            <p className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4 text-center">{error}</p>
          )}
          {message && (
            <p className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-center">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Retapez le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-1/2 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi...
                  </span>
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}