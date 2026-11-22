import React, { useState } from "react";

function Header({ onOpenNotifications, onLogout }) {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  function handleLogout() {
    setShowLogoutPopup(false);
    onLogout();
  }

  return (
    <>
      <header className="top-header">
        <div className="welcome-message">
          <h1>Hello, Mama! 👋</h1>
          <p>You're doing great on your maternal health journey!</p>
        </div>

        <div className="header-actions">
          <button
            className="notification-button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
          >
            <i className="fa-regular fa-bell"></i>
            <span className="notification-count">2</span>
          </button>

          <button
            className="profile-button"
            onClick={() => setShowLogoutPopup(true)}
            aria-label="Log out"
          >
            <span className="profile-avatar">
              <i className="fa-solid fa-user"></i>
            </span>

            <span className="logout-text">Logout</span>
            <i className="fa-solid fa-right-from-bracket logout-icon"></i>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>

            <h2>Confirm Logout</h2>

            <p>
              Are you sure you want to log out of your account?
              You'll need to log in again to access your dashboard.
            </p>

            <div className="logout-modal-actions">
              <button
                className="cancel-logout-button"
                onClick={() => setShowLogoutPopup(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-logout-button"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;