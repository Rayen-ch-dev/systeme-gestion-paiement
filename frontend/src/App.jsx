import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardFC";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationCodePage from "./pages/VerificationCodePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Get user data from localStorage or your auth context
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin' || user.role === 'comptable') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'super_admin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (user) {
    // Redirect based on user role
    if (user.role === 'admin' || user.role === 'comptable') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'super_admin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/verification-code" element={
          <PublicRoute>
            <VerificationCodePage />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user', 'formateur', 'comptable']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin', 'comptable', 'super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Default route */}
        <Route path="/" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* 404 - Not Found */}
        <Route path="*" element={
          <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-10">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-slate-900">Page introuvable</h1>
              <p className="text-slate-600 text-sm">La page demandée n'existe pas.</p>
              <div className="mt-4 flex gap-2 justify-center">
                <a href="/" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">Accueil</a>
                <a href="/dashboard" className="rounded-md bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-sm">Tableau de bord</a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <>
      <Header />
      <AppContent />
    </>
  );
}
