
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import Notifications from "./pages/Notifications";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  function handleLogin() {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  }

  function handleCreateAccount() {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentPage("login");
  }

  function handleOpenNotifications() {
    setCurrentPage("notifications");
  }

  function handleBackToDashboard() {
    setCurrentPage("dashboard");
  }

  // Show Create Account page
  if (!isLoggedIn && currentPage === "create-account") {
    return (
      <CreateAccount
        onCreateAccount={handleCreateAccount}
        onBackToLogin={() => setCurrentPage("login")}
      />
    );
  }

  // Show Forgot Password page
  if (!isLoggedIn && currentPage === "forgot-password") {
    return (
      <ForgotPassword
        onBackToLogin={() => setCurrentPage("login")}
      />
    );
  }

  // Show Login page
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
        onOpenCreateAccount={() => setCurrentPage("create-account")}
        onOpenForgotPassword={() => setCurrentPage("forgot-password")}
      />
    );
  }

  // Show Dashboard and Notifications
  return (
    <>
      {currentPage === "dashboard" ? (
        <Dashboard
          onOpenNotifications={handleOpenNotifications}
          onLogout={handleLogout}
        />
      ) : (
        <Notifications onBack={handleBackToDashboard} />
      )}
    </>
  );
}

export default App;
