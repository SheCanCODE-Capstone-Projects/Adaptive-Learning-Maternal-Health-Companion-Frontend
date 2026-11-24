
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">♡</div>
        <div>
          <h2>MaternaCare</h2>
          <p className="sidebar-label">Maternal Health Companion</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-label">MAIN MENU</p>

        <NavLink to="/" end className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>
          <span>⌂</span>
          <span>My Journey</span>
        </NavLink>

        <NavLink to="/appointments" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>
          <span>▣</span>
          <span>Appointments</span>
        </NavLink>

        <NavLink to="/diary" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>
          <span>✎</span>
          <span>My Diary</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-help">
          <span>♡</span>
          <h4>We're here for you</h4>
          <p>Your journey matters. Take care of yourself and your baby.</p>
        </div>

        <p className="sidebar-footer">
          © 2026 MaternaCare
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
