import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add React Router hooks

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const role = localStorage.getItem("role");
  let displayName = "Utilisateur";
  let initials = "U";
  let isConnected = false;

  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if (token === null) {
        isConnected = false;
      } else {
        isConnected = true;
        const raw = localStorage.getItem("profile");
        if (raw) {
          const p = JSON.parse(raw);
          const fn = p.name || "";
          const ln = p.lastname || "";
          displayName = (fn + (ln ? " " + ln : "")).trim() || displayName;
          const a = (fn || "U").slice(0, 1);
          const b = (ln || "").slice(0, 1);
          initials = (a + b).toUpperCase();
          isConnected = Boolean(fn || p.email);
        }
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
  }

  const handleProfileClick = () => {
    if (role) {
      // Use React Router navigation instead of window.location.hash
      if (location.pathname.startsWith("/dashboard")) {
        navigate(`${location.pathname}#profile`);
      } else {
        // If not on dashboard, navigate to appropriate profile page
        if (role === "comptable") {
          navigate("/adminprofileinfo");
        } else {
          navigate("/profile");
        }
      }
    }
  };

  const handleLogoClick = () => {
    if (isConnected) {
      // Navigate to appropriate dashboard based on role
      if (role === "super_admin") {
        navigate("/superadmindashboard");
      } else if (role === "comptable") {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
    navigate("/", { replace: true });
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 hover:bg-white px-2 py-1 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <span className="text-slate-700 max-w-[180px] truncate text-sm">
                  {displayName}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white/70 hover:bg-white px-2 py-1 text-slate-600 hover:text-slate-900 text-sm transition-colors"
                title="Se déconnecter"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center text-white font-semibold">
                F
              </div>
              <div className="text-slate-900 font-semibold tracking-tight">Formation</div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button 
            onClick={() => navigate("/help")}
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Aide
          </button>
          <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
            <span>FR</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-brand-600/40 via-brand-500/40 to-brand-700/40" />
    </header>
  );
}