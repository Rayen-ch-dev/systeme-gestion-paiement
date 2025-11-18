import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getAllUsers, validateUser } from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    (async () => {
      const result = await getAllUsers();
      if (result.ok) {
        // Filtrer uniquement les utilisateurs non approuvés
        const filteredUsers = (result.users.users || []).filter(
          (user) => user.status === "approuvé"
        );
        setPendingUsers(filteredUsers);
      } else {
        showNotification(result.error || "Erreur lors du chargement des utilisateurs", "error");
      }
    })();
  }, []);

  const handleStatusChange = async (id, status) => {
    const result = await validateUser(id, status);
    if (result.ok) {
      setPendingUsers(pendingUsers.filter((u) => u._id !== id));
      showNotification(
        status === "approuvé" ? "Utilisateur accepté ✅" : "Utilisateur rejeté ❌",
        status === "approuvé" ? "success" : "error"
      );
    } else showNotification(result.error, "error");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen p-6 bg-slate-50 overflow-hidden">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white transition-all duration-300 ${
            notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mx-auto max-w-6xl grid gap-6 relative">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-[var(--shadow-soft)]">

          {/* Subtle background blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-slate-400/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-slate-500/10 blur-3xl" />
          </div>

          <div className="relative p-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[11px] text-slate-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Comptable
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Comptable Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600 max-w-prose">
                  Gérer les utilisateurs en attente et leurs demandes.
                </p>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0">
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
              </div>
            </div>

            {/* Pending Users */}
            <div className="mt-6 space-y-4">
              {pendingUsers.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No pending user requests.</p>
              ) : (
                pendingUsers.map((user) => (
                  <div
                    key={user._id}
                    className="relative p-4 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">
                        {user.name} {user.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-sm text-slate-400">{user.role}</p>
                    </div>

                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleStatusChange(user._id, "approuvé")}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(user._id, "non-approuvé")}
                        className="px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all duration-300"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}