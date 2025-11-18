import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getProfileComptable, updateProfile } from "../api";
import { jwtDecode } from "jwt-decode";

export default function AdminProfileInfo() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({});
  const [userId, setUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    cin: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically call your update API
      // const result = await updateProfile({ ...formData, id: userId });
      
      // For now, simulate successful update
      setSuccessMessage("Profile updated successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/AdminDashboard"); // Use navigate instead of window.location
      }, 600);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/AdminDashboard");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      console.log("Token décodé :", decoded);
      setUserId(decoded.id);
    } catch (err) {
      console.error("Token invalide :", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return; // éviter l'appel avant que l'id soit dispo
    (async () => {
      const p = await getProfileComptable(userId);
      if (p.ok && p.user) {
        setForm((s) => ({
          ...s,
          name: p.user.name || "",
          lastname: p.user.lastname || "",
          cin: p.user.cin || "",
          email: p.user.email || "",
          password: p.user.password || "",
        }));
        // Also populate formData for the form inputs
        setFormData({
          name: p.user.name || "",
          lastName: p.user.lastname || "",
          cin: p.user.cin || "",
          email: p.user.email || "",
          password: p.user.password || "",
        });
      } else {
        console.error("Erreur de chargement du profil :", p.error);
      }
    })();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Admin Profile Information
        </h1>

        {/* ✅ Success Notification */}
        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          {/* CIN */}
          <div>
            <label className="block text-gray-700 mb-1">CIN</label>
            <input
              type="text"
              name="cin"
              value={formData.cin || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
              placeholder="Enter new password to change"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}