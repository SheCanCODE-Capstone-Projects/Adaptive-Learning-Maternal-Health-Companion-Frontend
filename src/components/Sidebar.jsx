
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>MaternalCare</h2>
        <p>Health Companion</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/appointments">
          📅 Appointments
        </NavLink>

        <NavLink to="/diary">
          📖 My Diary
        </NavLink>

        <NavLink to="/notifications">
          🔔 Notifications
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>Your health, your journey.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
