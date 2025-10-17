import React from "react";

export default function StatusAlert({ status, adminContact, role }) {
  if (!status) return null;

  if (status === "pending") {
    return (
      <div className="mb-4 rounded-md bg-amber-50 border-l-4 border-amber-400 p-3 flex gap-3 items-start">
        <div className="text-amber-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2m6 6a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <div className="text-amber-700">
          <p className="font-semibold">Votre compte est en cours de validation</p>
          <p className="text-sm">Votre compte est en cours de validation par notre équipe administrative. Vous recevrez une notification par email dès que votre compte sera activé.</p>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="mb-4 rounded-md bg-red-50 border-l-4 border-red-400 p-3 flex gap-3 items-start">
        <div className="text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
          </svg>
        </div>
        <div className="text-red-700">
          <p className="font-semibold">Inscription non approuvée</p>
          <p className="text-sm">Votre inscription n'a pas été approuvée. Veuillez contacter l'administration pour plus d'informations.</p>
          {adminContact ? (
            <div className="mt-2 text-sm text-slate-600">
              <div>Email : <a href={`mailto:${adminContact.email}`} className="text-brand-700 hover:text-brand-800">{adminContact.email}</a></div>
              <div>Téléphone : <a href={`tel:${adminContact.phone}`} className="text-brand-700 hover:text-brand-800">{adminContact.phone}</a></div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="mb-4 rounded-md bg-green-50 border-l-4 border-green-400 p-3 flex gap-3 items-start">
        <div className="text-green-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-green-700">
          <p className="font-semibold">Compte activé</p>
          <p className="text-sm">Connexion réussie. Redirection vers le tableau de bord {role ? `: ${role}` : ""}…</p>
        </div>
      </div>
    );
  }

  return null;
}