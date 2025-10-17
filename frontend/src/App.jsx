import React from "react";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const Page = path === "/register" ? RegisterPage : LoginPage;
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <Page />
      </main>
    </div>
  );
}
