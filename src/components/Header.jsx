
import React from "react";

function Header() {
  return (
    <header className="top-header">
      <div className="welcome-message">
        <h1>Hello, Mama! 👋</h1>
        <p>You're doing great on your maternal health journey!</p>
      </div>

      <div className="header-actions">
        <button className="notification-button" aria-label="Notifications">
          <i className="fa-regular fa-bell"></i>
          <span className="notification-count">1</span>
        </button>

        <button className="profile-button">
          <span className="profile-avatar">RW</span>
          <span>Ruth</span>
          <i className="fa-solid fa-chevron-down"></i>
        </button>
      </div>
    </header>
  );
}

export default Header;
