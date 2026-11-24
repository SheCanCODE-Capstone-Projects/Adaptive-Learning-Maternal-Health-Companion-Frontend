import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/learn" className="logo">
          <span className="logo-icon">✚</span>
          MamaCare
        </NavLink>

        <div className="nav-links">
          <NavLink to="/learn">Learn</NavLink>
          <NavLink to="/facilities">Facilities</NavLink>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          Health Education
        </div>
      </div>
    </nav>
  );
}

export default Navbar;