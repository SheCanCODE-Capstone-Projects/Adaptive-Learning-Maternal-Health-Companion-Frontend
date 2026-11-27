import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import Notifications from "./pages/Notifications";
import Header from "./components/Header";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const [unreadCount, setUnreadCount] = useState(0);

  function handleLogin() {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  }

  function handleCreateAccount() {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setCurrentPage("login");
    setUnreadCount(0);
  }

  function handleOpenNotifications() {
    setCurrentPage("notifications");
  }

  function handleBackToDashboard() {
    setCurrentPage("dashboard");
  }

  if (!isLoggedIn && currentPage === "create-account") {
    return (
      <CreateAccount
        onCreateAccount={handleCreateAccount}
        onBackToLogin={() => setCurrentPage("login")}
      />
    );
  }

  if (!isLoggedIn && currentPage === "forgot-password") {
    return (
      <ForgotPassword
        onBackToLogin={() => setCurrentPage("login")}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
        onOpenCreateAccount={() => setCurrentPage("create-account")}
        onOpenForgotPassword={() => setCurrentPage("forgot-password")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Header
        onOpenNotifications={handleOpenNotifications}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      {currentPage === "notifications" ? (
        <Notifications
          onBack={handleBackToDashboard}
          onUnreadCountChange={setUnreadCount}
        />
      ) : (
        <Dashboard
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenNotifications={handleOpenNotifications}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;