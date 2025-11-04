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

  async register({ name, lastname, cin, email, password, role, banque, rib }) {
    if (!name || !lastname || !cin || !email || !password) {
      return { ok: false, error: "Champs requis manquants" };
    }
    if (role !== "super_admin") {
      if (!banque || !rib) return { ok: false, error: "Banque et RIB requis" };
    }

    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastname, cin, email, password, role, banque, rib }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.message || `HTTP ${res.status}` };
    }

    try {
      const existing = localStorage.getItem("profile");
      const current = existing ? JSON.parse(existing) : {};
      const next = { ...current, email, name, lastname };
      localStorage.setItem("profile", JSON.stringify(next));
    } catch {}

    return { ok: true, user: data?.user };
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 100));
    try { localStorage.clear(); } catch {}
    return { ok: true };
  },
};

export const profile = {
  async getProfile() {
    await new Promise((r) => setTimeout(r, 150));
    try {
      const raw = localStorage.getItem("profile");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  async updateProfile(data) {
    // Validate on front only (pages already validate fields; this is a safety net)
    if (!data) return { ok: false, error: "Invalid payload" };
    await new Promise((r) => setTimeout(r, 250));
    try {
      const existing = localStorage.getItem("profile");
      const current = existing ? JSON.parse(existing) : {};
      const next = { ...current, ...data };
      localStorage.setItem("profile", JSON.stringify(next));
      return { ok: true, profile: next };
    } catch (e) {
      return { ok: false, error: "Storage error" };
    }
  },
};
