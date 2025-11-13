// Front-only API layer (can be swapped with real backend later)
// Do NOT change UI pages to use localStorage directly; use these functions.

export const auth = {
  async login({ email, password }) {
    // Basic checks
    if (!email || !password) return { status: "rejected", error: "Missing credentials" };

    // Call backend auth
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = data?.message || `HTTP ${res.status}`;
      return { status: "rejected", error };
    }

    const token = data?.token;
    const user = data?.user || {};
    const role = user?.role || null;

    try {
      if (token) localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);
      const existing = localStorage.getItem("profile");
      const current = existing ? JSON.parse(existing) : {};
      const nextProfile = { ...current, email: user.email || email, name: user.name, lastname: user.lastname };
      localStorage.setItem("profile", JSON.stringify(nextProfile));
    } catch {}

    return { status: "active", role, token, user };
  },

  async register({ name, lastname, cin, email, password, role, banque, rib, specialite, fonction }) {
  // Vérification des champs de base
  if (!name || !lastname || !cin || !email || !password || !role) {
    return { ok: false, error: "Champs requis manquants" };
  }

  // Règles spécifiques selon le rôle
  if (role === "formateur") {
    if (!specialite) {
      return { ok: false, error: "Le champ spécialité est obligatoire pour les formateurs" };
    }
    if (!banque || !rib) {
      return { ok: false, error: "Banque et RIB sont obligatoires pour les formateurs" };
    }
  } else if (role === "coordinateur") {
    if (!fonction) {
      return { ok: false, error: "Le champ fonction est obligatoire pour les coordinateurs" };
    }
    if (!banque || !rib) {
      return { ok: false, error: "Banque et RIB sont obligatoires pour les coordinateurs" };
    }
  }

  // Les autres rôles (ex: super_admin) n’ont pas besoin de banque/rib/spécialité/fonction

  try {
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastname, cin, email, password, role, banque, rib, specialite, fonction }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }

    // Sauvegarde locale du profil
    const existing = localStorage.getItem("profile");
    const current = existing ? JSON.parse(existing) : {};
    const next = { ...current, email, name, lastname };
    localStorage.setItem("profile", JSON.stringify(next));

    return { ok: true, user: data?.user };

  } catch (error) {
    console.error("Erreur de connexion :", error);
    return { ok: false, error: "Impossible de se connecter au serveur" };
  }
}
,

  async logout() {
    await new Promise((r) => setTimeout(r, 100));
    try { localStorage.clear(); } catch {}
    return { ok: true };
  },
};

export async function getProfile(userId) {
  if (!userId) {
    return { ok: false, error: "ID utilisateur manquant" };
  }

  try {
    const res = await fetch(`http://localhost:5000/api/users/getUserById/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }

    return { ok: true, user: data?.user };
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    return { ok: false, error: "Impossible de contacter le serveur" };
  }
}
// api.js


export async function updateProfile(data) {
  if (!data || !data.id) return { ok: false, error: "Invalid payload or missing user ID" };

  const token = localStorage.getItem("token");
  if (!token) return { ok: false, error: "Missing authentication token" };

  try {
    const res = await fetch(`http://localhost:5000/api/users/updateUser/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return { ok: false, error: result.message || "Update failed" };
    }

    // Optionnel : stocker le profil mis à jour localement
    localStorage.setItem("profile", JSON.stringify(result.user || result));

    return { ok: true, profile: result.user || result };
  } catch (e) {
    console.error("Erreur dans updateProfile :", e);
    return { ok: false, error: "Network or server error" };
  }
}
//add comptable role in register function
export async function registerComptable({ name, lastname, cin, email, password, role, banque, rib }) {
  // Vérification des champs de base
  if (!name || !lastname || !cin || !email || !password || !role) {
    return { ok: false, error: "Champs requis manquants" };
  }
  // Règles spécifiques selon le rôle
  if (role === "comptable") {
    if (!banque || !rib) {
      return { ok: false, error: "Banque et RIB sont obligatoires pour les comptables" };
    }
  }

  // Les autres rôles (ex: super_admin) n’ont pas besoin de banque/rib/spécialité/fonction
  try {
    const res = await fetch("http://localhost:5000/api/comptable/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastname, cin, email, password, role, banque, rib }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }
    // Sauvegarde locale du profil
    const existing = localStorage.getItem("profile");
    const current = existing ? JSON.parse(existing) : {};
    const next = { ...current, email, name, lastname };
    localStorage.setItem("profile", JSON.stringify(next));
    return { ok: true, user: data?.user };
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return { ok: false, error: "Impossible de se connecter au serveur" };
  }
}

  export async function loginComptable({ email, password }) {
    // Basic checks
    if (!email || !password) return { status: "rejected", error: "Missing credentials" };

    // Call backend auth
    const res = await fetch("/api/comptable/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = data?.message || `HTTP ${res.status}`;
      return { status: "rejected", error };
    }

    const token = data?.token;
    const user = data?.user || {};



    try {
      if (token) localStorage.setItem("token", token);
      const existing = localStorage.getItem("profile");
      const current = existing ? JSON.parse(existing) : {};
      const nextProfile = { ...current, email: user.email || email, name: user.name, lastname: user.lastname };
      localStorage.setItem("profile", JSON.stringify(nextProfile));
    } catch {}

    return { status: "active", token, user };
  }
  //update getComptableProfile for comptable
export async function getProfileComptable(userId) {
  if (!userId) return { ok: false, error: "ID utilisateur manquant" };

  try {
    const res = await fetch(`http://localhost:5000/api/comptable/getComptableById/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({}));
    console.log("Réponse brute API :", data);

    // data contient directement les infos du user
    return { ok: true, user: data };
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    return { ok: false, error: "Impossible de contacter le serveur" };
  }
}
// updateProfileComptable
export async function updateProfileComptable(data) {
  if (!data || !data.id) return { ok: false, error: "Invalid payload or missing user ID" };
  const token = localStorage.getItem("token");
  if (!token) return { ok: false, error: "Missing authentication token" };

  try {
    const res = await fetch(`http://localhost:5000/api/comptable/updateComptable/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      return { ok: false, error: result.message || "Update failed" };
    }
    // Optionnel : stocker le profil mis à jour localement
    localStorage.setItem("profile", JSON.stringify(result.user || result));
    return { ok: true, profile: result.user || result };
  }
  catch (e) {
    console.error("Erreur dans updateProfileComptable :", e);
    return { ok: false, error: "Network or server error" };
  }
}
// get all users
export async function getAllUsers() {
  try {
    const res = await fetch("http://localhost:5000/api/users/getUsers", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }); 
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }
    return { ok: true, users: data };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return { ok: false, error: "Impossible de contacter le serveur" };
  }
}

