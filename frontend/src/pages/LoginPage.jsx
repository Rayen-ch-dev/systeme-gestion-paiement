import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import StatusAlert from "../components/StatusAlert";

export default function LoginPage() {
  const [status, setStatus] = useState(null); // null | 'pending' | 'rejected' | 'active'
  const [adminContact, setAdminContact] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock authentication to demonstrate UI states (no backend modifications)
  const mockAuthenticate = async ({ email, password }) => {
    // small delay to show loading
    await new Promise((r) => setTimeout(r, 700));

    if (email.includes("pending")) {
      return { status: "pending" };
    }
    if (email.includes("rejected")) {
      return {
        status: "rejected",
        adminContact: {
          email: "administration@institution.example",
          phone: "+33 1 23 45 67 89",
        },
      };
    }
    // otherwise active: choose role based on email keyword for demo
    let role = "Coordinateur";
    if (email.includes("super")) role = "Super Admin";
    if (email.includes("paie")) role = "Responsable de paie";
    if (email.includes("form")) role = "Formateur";

    return { status: "active", role };
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setStatus(null);
    setAdminContact(null);
    setRole(null);

    try {
      const res = await mockAuthenticate(values);
      if (res.status === "pending") {
        setStatus("pending");
      } else if (res.status === "rejected") {
        setStatus("rejected");
        setAdminContact(res.adminContact);
      } else if (res.status === "active") {
        setStatus("active");
        setRole(res.role);
        // simulate redirection to role-specific dashboard
        // replace with actual routing when backend is ready
        setTimeout(() => {
          // example redirect path
          const path = `/dashboard/${res.role.replace(/\s+/g, "-").toLowerCase()}`;
          window.location.href = path;
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setStatus("rejected");
      setAdminContact({
        email: "administration@institution.example",
        phone: "+33 1 23 45 67 89",
      });
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

          <div className="grid gap-3 mb-4">
            <button
              type="button"
              aria-label="Continuer avec Google"
              className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white h-11 px-4 text-sm text-slate-800 shadow-sm hover:bg-slate-50 hover:shadow active:translate-y-px focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 focus:ring-offset-white/70 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.042,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.652,16.042,19.001,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.042,6.053,28.761,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.197-5.238C29.128,35.091,26.715,36,24,36 c-5.202,0-9.619-3.324-11.279-7.958l-6.545,5.045C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.097,5.571c0,0,0,0,0,0l6.197,5.238 C35.126,40.813,44,35.5,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span className="font-medium">Continuer avec Google</span>
            </button>
            <button
              type="button"
              aria-label="Continuer avec Microsoft"
              className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white h-11 px-4 text-sm text-slate-800 shadow-sm hover:bg-slate-50 hover:shadow active:translate-y-px focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 focus:ring-offset-white/70 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <rect x="3" y="3" width="8" height="8" fill="#F35325"/>
                <rect x="13" y="3" width="8" height="8" fill="#81BC06"/>
                <rect x="3" y="13" width="8" height="8" fill="#05A6F0"/>
                <rect x="13" y="13" width="8" height="8" fill="#FFBA08"/>
              </svg>
              <span className="font-medium">Continuer avec Microsoft</span>
            </button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/70 backdrop-blur px-2 text-xs text-slate-500">ou</span>
            </div>
          </div>

          <StatusAlert status={status} adminContact={adminContact} role={role} />

          <LoginForm onSubmit={handleSubmit} loading={loading} />

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <a href="#help" className="hover:text-slate-700">Assistance</a>
            <a href="#language" className="hover:text-slate-700">Français (FR)</a>
          </div>
          <div className="mt-3 text-xs text-center text-slate-500">
            Nouveau sur la plateforme ? <a href="/register" className="text-brand-600 hover:text-brand-700 font-medium">Créer un compte</a>
          </div>
        </div>
      </div>
    </div>
  );
}