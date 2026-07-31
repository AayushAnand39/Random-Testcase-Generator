import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-badge">⚡</span>
        <span>Random Test Generator</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
          Legacy Generator
        </NavLink>
        <NavLink to="/ai-generator" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
          ✨ AI Generator
        </NavLink>
      </div>
    </nav>
  );
}