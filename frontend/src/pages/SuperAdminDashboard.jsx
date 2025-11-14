import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/loginSuperAdmin", { replace: true });
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [navigate]);

  if (loading || !isAuthenticated) return null;

  const HandleCreation = () => {
    window.location.href = "/CreateNewAdmin";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
    window.location.href = "/login";
  };

  return (
    <div className="relative min-h-screen p-6 bg-slate-50 overflow-hidden">
      <div className="mx-auto max-w-6xl grid gap-6 relative">

        {/* Main Card with same style as Dashboard */}
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-[var(--shadow-soft)]">

          {/* Background soft blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-slate-400/10 blur-3xl" />
          </div>

          <div className="relative p-7">
            <div className="flex items-start justify-between gap-4">

              {/* TITLE */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[11px] text-slate-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Super Admin</span>
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Super Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-600 max-w-prose">
                  Gérer les administrateurs et les accès du système.
                </p>
              </div>

              {/* ICON */}
              <div className="hidden sm:block">
                <div className="h-12 w-12 rounded-xl border border-white/70 bg-white/80 shadow-sm flex items-center justify-center">
                  <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/90 hover:bg-white text-slate-700 text-sm shadow-sm transition-all duration-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a2 2 0 002 2h3"/>
                </svg>
                Logout
              </button>

              {/* CREATE NEW ADMIN */}
              <button
                onClick={HandleCreation}
                className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl shadow-lg hover:from-brand-600 hover:to-brand-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm"
              >
                + Create New Admin
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
