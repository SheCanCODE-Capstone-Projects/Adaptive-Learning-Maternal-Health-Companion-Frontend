
import React from "react";

const navigation = [
  { label: "Dashboard", icon: "fa-house", page: "dashboard" },
  { label: "My Journey", icon: "fa-graduation-cap", page: "my-journey" },
  { label: "Appointments", icon: "fa-calendar-days", page: "appointments" },
  { label: "My Diary", icon: "fa-book-open", page: "diary" },
  { label: "Learn", icon: "fa-book-medical", page: "learn" },
  { label: "Facilities", icon: "fa-hospital", page: "facilities" },
  { label: "Progress", icon: "fa-chart-simple", page: "progress" },
  { label: "Content Review", icon: "fa-shield-heart", page: "content-review" },
];

function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <i className="fa-solid fa-heart-pulse"></i>
        </div>

        <h2>
          Maternal Health
          <br />
          Companion
        </h2>

        <p>Learn · Plan · Thrive</p>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <button
            type="button"
            key={item.label}
            className={`nav-link ${
              currentPage === item.page ? "active" : ""
            }`}
            onClick={() => onNavigate(item.page)}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-message">
        <i className="fa-solid fa-heart"></i>
        <p>
          Healthy Mum,
          <br />
          Healthy Baby <span>♥</span>
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
