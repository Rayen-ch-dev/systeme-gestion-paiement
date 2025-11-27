import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllUsers, validateUser, getProfileComptable } from "../api";
import emailjs from "emailjs-com";
import { jwtDecode } from "jwt-decode";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [profile, setProfile] = useState({ name: "", lastname: "", email: "", cin: "" });
  const [profileOpen, setProfileOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check if profile panel should be open based on URL hash
  useEffect(() => {
    setProfileOpen(location.hash === "#profile");
  }, [location.hash]);

  // Handle escape key to close profile panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && location.hash === "#profile") {
        navigate(location.pathname, { replace: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location.hash, location.pathname, navigate]);

  // Decode token and check password change requirement
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
        if (decoded.mustChangePassword) {
          navigate("/change-password");
        }
      } catch (err) {
        console.error("Token invalide :", err);
      }
    }
  }, [navigate]);

  // Fetch user profile when userId is available
  useEffect(() => {
    if (userId) {
      (async () => {
        const res = await getProfileComptable(userId);
        console.log("📌 Profil comptable récupéré :", res);
        
        if (res.ok && res.user) {
          // La structure de réponse est : { ok: true, user: { ok: true, user: {...} } }
          const userData = res.user.user || res.user;
          setProfile({
            name: userData.name || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            cin: userData.cin || ""
          });
        }
      })();
    }
  }, [userId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    (async () => {
      const result = await getAllUsers();
      if (result.ok) {
        const filteredUsers = (result.users.users || []).filter(
          (user) => user.status === "en-attente"
        );
        setPendingUsers(filteredUsers);
      } else {
        showNotification(
          result.error || "Erreur lors du chargement des utilisateurs",
          "error"
        );
      }
    })();
  }, []);

  const handleStatusChange = async (id, status, userEmail, userName) => {
    const result = await validateUser(id, status);
    if (result.ok) {
      setPendingUsers(pendingUsers.filter((u) => u._id !== id));

      let messageTitle = "";
      let messageBody = "";
      let showLoginButton = false;

      if (status === "approuvé") {
        messageTitle = "Félicitations ! Votre compte a été approuvé";
        messageBody = "Votre compte a été <strong>approuvé</strong> par notre équipe. Vous pouvez dès à présent accéder à toutes les fonctionnalités de notre plateforme.";
        showLoginButton = true;
      } else if (status === "non-approuvé") {
        messageTitle = "Statut de votre demande";
        messageBody = "Nous sommes désolés de vous informer que votre demande a été <strong>rejetée</strong>.<br>Pour plus d'informations concernant cette décision, veuillez contacter notre équipe de support.";
        showLoginButton = false;
      }

      const templateParams = {
        to_name: userName,
        to_email: userEmail,
        message_title: messageTitle,
        message_body: messageBody,
        show_login_button: showLoginButton ? "block" : "none",
        login_url: "http://localhost:5173/",
      };

      try {
        await emailjs.send(
          "service_kd8x74c",
          "template_ifjjbw4",
          templateParams,
          "jkbntAAOriqCFbpuy"
        );
        showNotification(
          status === "approuvé" ? "Utilisateur accepté ✅" : "Utilisateur rejeté ❌",
          status === "approuvé" ? "success" : "error"
        );
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'email:", err);
        showNotification("Erreur lors de l'envoi de l'email", "error");
      }
    } else {
      showNotification(result.error, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profile");
    navigate("/login", { replace: true });
  };

  const openProfilePanel = () => {
    navigate(`${location.pathname}#profile`);
  };

  const closeProfilePanel = () => {
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="relative min-h-screen p-6 bg-slate-50 overflow-hidden">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white transition-all duration-300 z-50 ${
            notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Profile Panel */}
      <div className="fixed inset-0 z-40" aria-modal="true" role="dialog" style={{ pointerEvents: profileOpen ? 'auto' : 'none' }}>
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ease-out ${profileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeProfilePanel}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-full max-w-md bg-white/90 backdrop-blur-lg border-r border-white/70 shadow-2xl overflow-auto transform transition-transform duration-300 ease-out ${profileOpen ? 'translate-x-0' : '-translate-x-full'} rounded-r-xl`}
        >
          <div className="p-4 border-b border-white/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-600 text-white flex items-center justify-center text-sm font-semibold ring-4 ring-white/60 shadow-sm">
                {((profile.name || 'U')[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{(profile.name || 'Utilisateur') + (profile.lastname ? ' ' + profile.lastname : '')}</div>
                <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-slate-500/10 text-slate-700 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  <span>Comptable</span>
                </div>
              </div>
            </div>
            <button 
              onClick={closeProfilePanel} 
              className="inline-flex items-center justify-center rounded-md border border-white/60 bg-white/70 hover:bg-white w-8 h-8 text-slate-600" 
              aria-label="Fermer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="p-4 grid gap-4">
            <section className="rounded-lg border border-white/70 bg-white/90 shadow-sm">
              <header className="px-3 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7a4 4 0 110-8 4 4 0 010 8z"/>
                </svg>
                Contact
              </header>
              <div className="px-3 pb-3 text-sm divide-y divide-slate-100/80">
                <div className="flex items-start py-2">
                  <span className="text-slate-500 w-28 shrink-0">Prénom</span>
                  <span className="font-medium text-slate-800">{profile.name || '—'}</span>
                </div>
                <div className="flex items-start py-2">
                  <span className="text-slate-500 w-28 shrink-0">Nom</span>
                  <span className="font-medium text-slate-800">{profile.lastname || '—'}</span>
                </div>
                <div className="flex items-start py-2">
                  <span className="text-slate-500 w-28 shrink-0">Email</span>
                  <span className="font-medium text-slate-800 break-words">{profile.email || '—'}</span>
                </div>
              </div>
            </section>
            <section className="rounded-lg border border-white/60 bg-white/70 shadow-sm">
              <header className="px-3 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 20a6.5 6.5 0 0113 0"/>
                </svg>
                Compte
              </header>
              <div className="px-3 pb-3 text-sm divide-y divide-slate-100/80">
                <div className="flex items-start py-2">
                  <span className="text-slate-500 w-28 shrink-0">CIN</span>
                  <span className="font-medium text-slate-800">{profile.cin || '—'}</span>
                </div>
              </div>
            </section>
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => navigate("/ProfileComptable")}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/60 bg-white/80 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 13.5l9.5-9.5 3.5 3.5L7.5 17H4v-3.5z"/>
                </svg>
                Modifier mon profil
              </button>
            </div>
          </div>
          <div className="p-4 border-t border-white/60">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/70 bg-white/90 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a2 2 0 002 2h3"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </aside>
      </div>

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
                
                <div className="mt-4 flex items-center gap-2">
                  <button 
                    onClick={() => navigate("/ProfileComptable")}
                    className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white/90 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 13.5l9.5-9.5 3.5 3.5L7.5 17H4v-3.5z"/>
                    </svg>
                    Modifier mon profil
                  </button>
                  <button 
                    onClick={openProfilePanel}
                    className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white/90 hover:bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h7"/>
                    </svg>
                    Ouvrir le panneau
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/90 hover:bg-white text-slate-700 text-sm shadow-sm transition-all duration-300"
                >
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
                        onClick={() => handleStatusChange(user._id, "approuvé", user.email, user.name)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(user._id, "non-approuvé", user.email, user.name)}
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