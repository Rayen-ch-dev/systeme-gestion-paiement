import React from "react";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardFC";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AddAdmin from "./components/AddAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfileInfo from "./components/AdminProfileInfo";
import LoginComptable from "./pages/LoginComptable";
import ProfileComptable from "./pages/ProfileComptable";
import LoginSuperAdmin from "./pages/LoginSuperAdmin";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:role?" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/superadmindashboard" element={<SuperAdminDashboard />} />
            <Route path="/createnewadmin" element={<AddAdmin />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/adminprofileinfo" element={<AdminProfileInfo />} />
            <Route path="/logincomptable" element={<LoginComptable />} />
            <Route path="/profilecomptable" element={<ProfileComptable />} />
            <Route path="/loginsuperadmin" element={<LoginSuperAdmin />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Separate component for 404 page
function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-10">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">Page introuvable</h1>
        <p className="text-slate-600 text-sm">La page que vous recherchez n'existe pas.</p>
        <div className="mt-4 flex gap-2 justify-center">
          <button 
            onClick={() => navigate("/")}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Accueil
          </button>
          <button 
            onClick={() => navigate("/dashboard")}
            className="rounded-md bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-sm"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}