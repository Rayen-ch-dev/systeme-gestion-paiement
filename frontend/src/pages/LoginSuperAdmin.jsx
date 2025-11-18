import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import StatusAlert from "../components/StatusAlert";
import { loginSuperAdmin } from "../api"; // <-- make sure this points to your new SuperAdmin API
import LoginFormSuperAdmin from "../components/LoginFormSuperAdmin";

export default function LoginSuperAdmin() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [status, setStatus] = useState(null);
  const [adminContact, setAdminContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state

  // Front API login
  const apiLogin = ({ email, password }) => loginSuperAdmin({ email, password });
  console.log(apiLogin);

  const handleSubmit = async (values) => {
    setLoading(true);
    setStatus(null);
    setAdminContact(null);
    setError("");

    try {
      const res = await apiLogin(values);
      console.log(res);
      
      if (typeof window !== "undefined") {
        const { token, user } = res;

        // Save token and profile
        if (typeof window !== "undefined") {
          const profile = {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            cin: user.cin,
            email: user.email,
            token: token,
          };
          localStorage.setItem("profile", JSON.stringify(profile));
          localStorage.setItem("token", token);
          localStorage.setItem("role", "super_admin"); // Store role for authorization
        }
          console.log("Redirection to /superadmindashboard");
        // Redirect to dashboard using navigate
        setTimeout(() => {
          navigate("/superadmindashboard", { replace: true });
        }, 800);
       
      } else {
        setError(res.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login. Please try again.");
      setAdminContact("support@platform.com"); // optional contact info
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-6 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-600/15 blur-3xl animate-blob animation-delay-2000" />
      <div className="w-full max-w-md relative">
        <div className="bg-white/70 backdrop-blur-lg rounded-xl p-7 shadow-[var(--shadow-soft)] border border-white/70">
          <div className="mb-5 flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-brand-600 text-white flex items-center justify-center">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zM5.5 20a6.5 6.5 0 0113 0"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Se connecter en tant que Super Admin
              </h1>
              <p className="text-sm text-slate-600">
                Accédez à votre espace d'administration sécurisé
              </p>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <StatusAlert status={status} adminContact={adminContact} />

          <LoginFormSuperAdmin onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}