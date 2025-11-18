import React, { use, useState } from "react";
import LoginForm from "../components/LoginForm";
import StatusAlert from "../components/StatusAlert";
import { auth } from "../api";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [status, setStatus] = useState(null); // null | 'pending' | 'rejected' | 'active'
  const [adminContact, setAdminContact] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 



  // Front API login (replaces previous mock)
  const apiLogin = (payload) => auth.login(payload);
  const handleSubmit = async (values) => {
    setLoading(true);
    setStatus(null);
    setAdminContact(null);
    setRole(null);

    try {
      const res = await apiLogin(values);
      if(res.role==="super_admin"){
        navigate("/superadmindashboard");
        
        return;
 
      }
      if (res.status === "pending") {
        setStatus("pending");
      } else if (res.status === "rejected") {
        setStatus("rejected");
        setAdminContact(null);
      } else if (res.status === "active") {
        setStatus("active");
        setRole(res.role);
        // simulate redirection to role-specific dashboard
        // replace with actual routing when backend is ready
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("role", res.role);
            // persist a minimal profile for header/slide-over usage
            const existing = localStorage.getItem("profile");
            const current = existing ? JSON.parse(existing) : {};
            const nextProfile = {
              ...current,
              email: values.email || current.email || "",
              name: values.name || current.name || "",
              lastname: values.lastname || current.lastname || "",
              cin: values.cin || current.cin || "",
              password: values.password || current.password || "",
              specialite: values.specialite || current.specialite || "",
              fonction: values.fonction || current.fonction || "",
            };
            localStorage.setItem("profile", JSON.stringify(nextProfile));
          }
        } catch { "error"}
        setTimeout(() => {
          // example redirect path
          const path = `/dashboard/${res.role.replace(/\s+/g, "-").toLowerCase()}`;
          navigate(path)
         ;
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setStatus("rejected");
      setAdminContact(null);
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
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zM5.5 20a6.5 6.5 0 0113 0"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Se connecter</h1>
              <p className="text-sm text-slate-600">Accédez à votre espace sécurisé de formation en ligne</p>
            </div>
          </div>




          <StatusAlert status={status} adminContact={adminContact} role={role} />

          <LoginForm onSubmit={handleSubmit} loading={loading} />
          <div className="mt-3 text-xs text-center text-slate-500">
            Nouveau sur la plateforme ? <a href="/register" className="text-brand-600 hover:text-brand-700 font-medium">Créer un compte</a>
          </div>
        </div>
      </div>
  
    </div>
  );
}