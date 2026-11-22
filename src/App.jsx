
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Log the user out
  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  }

  // Open the notifications page
  function handleOpenNotifications() {
    setCurrentPage("notifications");
  }

  // Return to the dashboard
  function handleBackToDashboard() {
    setCurrentPage("dashboard");
  }

  // Show Login page when the user is not logged in
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
          setCurrentPage("dashboard");
        }}
      />
    );
  }

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
