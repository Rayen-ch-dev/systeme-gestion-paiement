import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";  // <-- default import, no {}

const useAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) return false;

    // Check mustChangePassword flag
    if (decoded.mustChangePassword) return "change_password";

    return true;
  } catch {
    return false;
  }
};

export default function ProtectedRoute() {
  const authStatus = useAuth();

  if (authStatus === false) {
    // Not logged in or token invalid, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (authStatus === "change_password") {
    // User must change password before accessing other routes
    return <Navigate to="/change-password" replace />;
  }

  // Authenticated and no password change required
  return <Outlet />; // Render child routes
}
