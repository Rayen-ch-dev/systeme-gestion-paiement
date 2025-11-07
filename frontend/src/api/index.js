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
      // Store the complete user object in localStorage
      const userData = {
        ...user,
        token,
        role,
        // Ensure we have all required fields
        firstName: user.firstName || user.name || '',
        lastName: user.lastName || user.lastname || '',
        email: user.email || email,
        cin: user.cin || '',
        specialite: user.specialite || '',
        fonction: user.fonction || ''
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // For backward compatibility, also store in profile
      const profileData = {
        ...userData,
        name: userData.firstName, // For backward compatibility
        lastname: userData.lastName // For backward compatibility
      };
      localStorage.setItem('profile', JSON.stringify(profileData));
      
      // Store token and role separately for backward compatibility
      if (token) localStorage.setItem('token', token);
      if (role) localStorage.setItem('role', role);
      
    } catch (error) {
      console.error('Error storing user data:', error);
      return { status: "rejected", error: "Error saving user data" };
    }

    return { 
      status: "active", 
      role, 
      token, 
      user: {
        ...user,
        firstName: user.firstName || user.name || '',
        lastName: user.lastName || user.lastname || ''
      } 
    };
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
      // Get the complete user object from localStorage
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : {};
      
      // Get additional profile data if it exists
      const profileRaw = localStorage.getItem("profile");
      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      
      // Return combined user data with profile data
      return {
        ...user,
        ...profile,
        // Ensure we have all required fields with fallbacks
        firstName: user.firstName || user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        cin: user.cin || '',
        specialite: user.specialite || '',
        fonction: user.fonction || '',
        role: user.role || ''
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return {};
    }
  },

  async updateProfile(data) {
    // Validate on front only (pages already validate fields; this is a safety net)
    if (!data) return { ok: false, error: "Invalid payload" };
    await new Promise((r) => setTimeout(r, 250));
    try {
      // Get existing user data
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : {};
      
      // Update user data with new values
      const updatedUser = {
        ...user,
        firstName: data.firstName !== undefined ? data.firstName : user.firstName,
        lastName: data.lastName !== undefined ? data.lastName : user.lastName,
        email: data.email !== undefined ? data.email : user.email,
        cin: data.cin !== undefined ? data.cin : user.cin,
        specialite: data.specialite !== undefined ? data.specialite : user.specialite,
        fonction: data.fonction !== undefined ? data.fonction : user.fonction,
      };
      
      // Save updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update profile data for backward compatibility
      const profileRaw = localStorage.getItem("profile") || '{}';
      const currentProfile = JSON.parse(profileRaw);
      const updatedProfile = {
        ...currentProfile,
        ...data,
        // Ensure name fields are in sync
        name: data.firstName || currentProfile.name,
        lastname: data.lastName || currentProfile.lastname
      };
      
      localStorage.setItem("profile", JSON.stringify(updatedProfile));
      
      return { 
        ok: true, 
        profile: {
          ...updatedUser,
          ...updatedProfile
        }
      };
    } catch (e) {
      return { ok: false, error: "Storage error" };
    }
  },
};
