import React, { useMemo, useState, useEffect } from "react";
import ProfilePage from "./ProfilePage";

export default function Dashboard() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
  const roleSlug = path.split("/")[2] || "formateur";

  const role = useMemo(() => {
    const map = {
      "formateur": "Formateur",
      "coordinateur": "Coordinateur",
      "super-admin": "Super Admin",
      "responsable-de-paie": "Responsable de paie",
    };
    return map[roleSlug] || "Formateur";
  }, [roleSlug]);

  const isFormateur = role === "Formateur";
  const isCoordinateur = role === "Coordinateur";
  const [expanded, setExpanded] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [profile, setProfile] = useState({ name: "", lastname: "", email: "", cin: "", password: "", specialite: "", fonction: "" });
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("profile") : null;
      console.log(raw);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const readHash = () => {
      if (typeof window === "undefined") return;
      setProfileOpen(window.location.hash === "#profile");
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    const onKey = (e) => {
      if (e.key === "Escape" && typeof window !== "undefined") {
        if (window.location.hash === "#profile") window.location.hash = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = profileOpen ? "hidden" : "";
    }
    return () => { if (typeof document !== "undefined") document.body.style.overflow = ""; };
  }, [profileOpen]);

  return (
    <div className="relative min-h-[calc(100vh-56px)] p-6 bg-slate-50 overflow-hidden">
      <div className="mx-auto max-w-6xl grid gap-6 relative">
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog" style={{pointerEvents: profileOpen ? 'auto' : 'none'}}>
            <div
              className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ease-out ${profileOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => { if (typeof window !== 'undefined') window.location.hash = ''; }}
            />
            <aside
              className={`absolute left-0 top-0 h-full w-full max-w-md bg-white/90 backdrop-blur-lg border-r border-white/70 shadow-2xl overflow-auto transform transition-transform duration-300 ease-out ${profileOpen ? 'translate-x-0' : '-translate-x-full'} rounded-r-xl`}
            >
              <div className="p-4 border-b border-white/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-semibold ring-4 ring-white/60 shadow-sm">
                    {((profile.name||'U')[0]||'U').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{(profile.name||'Utilisateur') + (profile.lastname ? ' ' + profile.lastname : '')}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-500/10 text-brand-700 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                      <span>{role}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { if (typeof window !== 'undefined') window.location.hash = ''; }} className="inline-flex items-center justify-center rounded-md border border-white/60 bg-white/70 hover:bg-white w-8 h-8 text-slate-600" aria-label="Fermer">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-4 grid gap-4">
                <section className="rounded-lg border border-white/70 bg-white/90 shadow-sm">
                  <header className="px-3 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7a4 4 0 110-8 4 4 0 010 8z"/></svg>
                    Contact
                  </header>
                  <div className="px-3 pb-3 text-sm divide-y divide-slate-100/80">
                    <div className="flex items-start py-2">
                      <span className="text-slate-500 w-28 shrink-0">Prénom</span>
                      <span className="font-medium text-slate-800">{profile.name||'—'}</span>
                    </div>
                    <div className="flex items-start py-2">
                      <span className="text-slate-500 w-28 shrink-0">Nom</span>
                      <span className="font-medium text-slate-800">{profile.lastname||'—'}</span>
                    </div>
                    <div className="flex items-start py-2">
                      <span className="text-slate-500 w-28 shrink-0">Email</span>
                      <span className="font-medium text-slate-800 break-words">{profile.email||'—'}</span>
                    </div>
                  </div>
                </section>
                <section className="rounded-lg border border-white/60 bg-white/70 shadow-sm">
                  <header className="px-3 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 20a6.5 6.5 0 0113 0"/></svg>
                    Compte
                  </header>
                  <div className="px-3 pb-3 text-sm divide-y divide-slate-100/80">
                    <div className="flex items-start py-2">
                      <span className="text-slate-500 w-28 shrink-0">CIN</span>
                      <span className="font-medium text-slate-800">{profile.cin||'—'}</span>
                    </div>
                    <div className="flex items-start py-2">
                      <span className="text-slate-500 w-28 shrink-0">Mot de passe</span>
                      <span className="font-medium text-slate-800">••••••••</span>
                    </div>
                  </div>
                </section>
                {(isFormateur || isCoordinateur) ? (
                  <section className="rounded-lg border border-white/70 bg-white/90 shadow-sm">
                    <header className="px-3 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6"/></svg>
                      Métier
                    </header>
                    <div className="px-3 pb-3 text-sm divide-y divide-slate-100/80">
                      {isFormateur ? (
                        <div className="flex items-start py-2"><span className="text-slate-500 w-28 shrink-0">Spécialité</span><span className="font-medium text-slate-800">{profile.specialite||'—'}</span></div>
                      ) : null}
                      {isCoordinateur ? (
                        <div className="flex items-start py-2"><span className="text-slate-500 w-28 shrink-0">Fonction</span><span className="font-medium text-slate-800">{profile.fonction||'—'}</span></div>
                      ) : null}
                    </div>
                  </section>
                ) : null}
                <div className="flex items-center justify-end gap-2">
                  <a href="/profile" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/60 bg-white/80 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 13.5l9.5-9.5 3.5 3.5L7.5 17H4v-3.5z"/></svg>
                    Modifier mon profil
                  </a>
                </div>
              </div>
              <div className="p-4 border-t border-white/60">
                <button
                  onClick={() => { try { localStorage.clear(); } catch {}; window.location.href = '/'; }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/70 bg-white/90 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a2 2 0 002 2h3"/></svg>
                  Se déconnecter
                </button>
              </div>
            </aside>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-[var(--shadow-soft)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-slate-400/10 blur-3xl" />
          </div>
          <div className="relative p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[11px] text-slate-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>En ligne</span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600 max-w-prose">Sprint en cours — nous nous concentrons sur la gestion de profil. Le contenu métier du dashboard sera ajouté prochainement.</p>
                <div className="mt-4 flex items-center gap-2">
                  <a href="/profile" className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white/90 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 13.5l9.5-9.5 3.5 3.5L7.5 17H4v-3.5z"/></svg>
                    Modifier mon profil
                  </a>
                  <button onClick={() => { if (typeof window !== 'undefined') window.location.hash = '#profile'; }} className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white/90 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h7"/></svg>
                    Ouvrir le panneau
                  </button>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="h-12 w-12 rounded-xl border border-white/70 bg-white/80 shadow-sm flex items-center justify-center">
                  <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
