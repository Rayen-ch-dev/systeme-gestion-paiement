import React, { useState } from "react";

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Adresse email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre.nom@institution.tld"
          required
          className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-300 transition"
        />
      </label>

      <label className="block relative">
        <span className="text-sm font-medium text-slate-700">Mot de passe</span>
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-300 pr-10 transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-9 text-slate-400 hover:text-slate-600"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={show}
        >
          {show ? (
            // Eye-off icon (hide password)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 013.27-4.5M3 3l18 18M9.88 9.88a3 3 0 104.24 4.24" />
            </svg>
          ) : (
            // Eye icon (show password)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </label>

      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-slate-600">
          <input type="checkbox" className="mr-2" /> Se souvenir
        </label>
        <a className="text-sm text-brand-600 hover:text-brand-700 hover:underline" href="#forgot">Mot de passe oublié ?</a>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md active:translate-y-px transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : null}
          Se connecter
        </button>
      </div>
    </form>
  );
}