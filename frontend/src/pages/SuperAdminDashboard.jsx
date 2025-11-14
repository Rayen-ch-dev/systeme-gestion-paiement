import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // loading until auth is confirmed
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/loginSuperAdmin", { replace: true });
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    // Optionally show a spinner or nothing while checking
    return null;
  }

  if (!isAuthenticated) {
    // Render nothing because redirect is happening
    return null;
  }

  const HandleCreation = () => {
    window.location.href = "/CreateNewAdmin";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Dashboard Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-wide">
    Super Admin Dashboard
  </h1>

  <div className="flex flex-col sm:flex-row gap-3">
    <a
      href="/login"
      className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-2xl shadow-lg hover:from-brand-600 hover:to-brand-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
    >
      Logout
    </a>

    <button
      onClick={HandleCreation}
      className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-2xl shadow-lg hover:from-brand-600 hover:to-brand-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
    >
      + Create New Admin
    </button>
  </div>
</div>

              
    </div>
  );
}
