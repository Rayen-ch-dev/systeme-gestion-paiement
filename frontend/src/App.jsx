import React from "react";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardFC";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AddAdmin from "./components/AddAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfileInfo from "./components/AdminProfileInfo";
export default function App() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  let Page;
  if (path === "/" || path === "/login") {
    Page = LoginPage;
  } else if (path === "/register") {
    Page = RegisterPage;
  } else if (path.startsWith("/dashboard")) {
    Page = Dashboard;
  } else if (path === "/profile") {
    Page = ProfilePage;
  }else if (path==="/ForgotPassword") {
    Page = ForgotPassword;
  }else if (path==="/reset-password") {
    Page = ResetPasswordPage;
  }
  else if (path==="/SuperAdminDashboard"){
    Page=SuperAdminDashboard;
  }
  else if(path==="/CreateNewAdmin"){
    Page=AddAdmin;
  }
  else if(path==="/AdminDashboard"){
    Page=AdminDashboard;
  }
  else if(path==="/AdminProfileInfo"){
    Page=AdminProfileInfo;
  }
  
  else {
    Page = () => (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">Page introuvable</h1>
          <p className="text-slate-600 text-sm">L'URL {path} n'existe pas.</p>
          <div className="mt-4 flex gap-2 justify-center">
            <a href="/" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">Accueil</a>
            <a href="/dashboard" className="rounded-md bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-sm">Dashboard</a>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <Page />
      </main>
    </div>
  );
}
