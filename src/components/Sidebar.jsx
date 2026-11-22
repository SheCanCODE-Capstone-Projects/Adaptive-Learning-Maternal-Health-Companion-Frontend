
import React from "react";

const navigation = [
  { label: "Dashboard", icon: "fa-house", active: true },
  { label: "My Journey", icon: "fa-graduation-cap" },
  { label: "Appointments", icon: "fa-calendar-days" },
  { label: "My Diary", icon: "fa-book-open" },
  { label: "Learn", icon: "fa-book-medical" },
  { label: "Facilities", icon: "fa-hospital" },
  { label: "Progress", icon: "fa-chart-simple" },
  { label: "Content Review", icon: "fa-shield-heart" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <i className="fa-solid fa-heart-pulse"></i>
        </div>

        <h2>Maternal Health<br />Companion</h2>
        <p>Learn · Plan · Thrive</p>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <a
            href="#"
            key={item.label}
            className={`nav-link ${item.active ? "active" : ""}`}
            onClick={(event) => event.preventDefault()}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-message">
        <i className="fa-solid fa-heart"></i>
        <p>
          Healthy Mum,<br />
          Healthy Baby <span>♥</span>
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
