import React from "react";

export default function Header() {
  const role = localStorage.getItem("role");
  let displayName = "Utilisateur";
  let initials = "U";
  let isConnected = false;
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      if(token === null){
        isConnected = false;
      }
      else{
        isConnected = true;
        const raw = localStorage.getItem("profile");
      if (raw) {
        const p = JSON.parse(raw);
        const fn = p.name || "";
        const ln = p.lastname || "";
        displayName = (fn + (ln ? " " + ln : "")).trim() || displayName;
        const a = (fn || "U").slice(0,1);
        const b = (ln || "").slice(0,1);
        initials = (a + b).toUpperCase();
        isConnected = Boolean(fn || p.email);
      }
      }

    } catch {}
  }
return (
  <header className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
    <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                if (role) {
                  window.location.hash = "#profile";
                } else {
                  return;
                }
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 hover:bg-white px-2 py-1"
          >
            <div className="h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <span className="text-slate-700 max-w-[180px] truncate">{displayName}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center text-white font-semibold">
              F
            </div>
            <div className="text-slate-900 font-semibold tracking-tight">Formation</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <a href="#help" className="text-slate-600 hover:text-slate-900">
          Aide
        </a>
        <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
          <span>FR</span>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </button>
      </div>
    </div>

    <div className="h-0.5 w-full bg-gradient-to-r from-brand-600/40 via-brand-500/40 to-brand-700/40" />
    {/* bouton de déconnexion */}
  </header>
);


};