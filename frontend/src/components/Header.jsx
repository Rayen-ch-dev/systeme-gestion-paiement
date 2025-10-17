import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-brand-600 flex items-center justify-center text-white font-semibold">F</div>
          <div className="text-slate-900 font-semibold tracking-tight">Formation</div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a href="#help" className="text-slate-600 hover:text-slate-900">Aide</a>
          <button className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
            <span>FR</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
          </button>
        </div>
      </div>
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-600/40 via-brand-500/40 to-brand-700/40" />
    </header>
  );
}
