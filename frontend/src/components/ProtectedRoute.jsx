import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    if (exp * 1000 < Date.now()) {
      // Token expired
      return false;
    }
    return true; // Token exists and is valid
  } catch (error) {
    // Invalid token format
    return false;
  }
};

export default function ProtectedRoute( ) {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Optionally add role check here if needed
  // if (allowedRoles && !allowedRoles.includes(user.role)) {
  //    return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />; // Render child routes
}

