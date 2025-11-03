// Front-only API layer (can be swapped with real backend later)
// Do NOT change UI pages to use localStorage directly; use these functions.

export const auth = {
  async login({ email, password }) {
    // Basic checks
    if (!email || !password) return { status: "rejected", error: "Missing credentials" };

    // Try real backend auth first
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        return { status: "rejected", error: `HTTP ${res.status}` };
      }
      const data = await res.json().catch(() => ({}));
      // Try to use role from backend, otherwise infer from email keywords
      let role = data.role || "Coordinateur";
      if (!data.role) {
        if (email.includes("super")) role = "Super Admin";
        if (email.includes("paie")) role = "Responsable de paie";
        if (email.includes("form")) role = "Formateur";
      }
      try {
        localStorage.setItem("role", role);
        const existing = localStorage.getItem("profile");
        const current = existing ? JSON.parse(existing) : {};
        const nextProfile = { ...current, email };
        localStorage.setItem("profile", JSON.stringify(nextProfile));
      } catch {}
      return { status: "active", role };
    } catch (e) {
      // Fallback front-only logic (network issues)
      let role = "Coordinateur";
      if (email.includes("super")) role = "Super Admin";
      if (email.includes("paie")) role = "Responsable de paie";
      if (email.includes("form")) role = "Formateur";
      try {
        localStorage.setItem("role", role);
        const existing = localStorage.getItem("profile");
        const current = existing ? JSON.parse(existing) : {};
        const nextProfile = { ...current, email };
        localStorage.setItem("profile", JSON.stringify(nextProfile));
      } catch {}
      return { status: "active", role, fallback: true };
    }
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
