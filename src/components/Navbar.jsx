import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <Logo size={36} />
          Clipo
        </Link>
      </div>

      <ul className="navbar-nav">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Clipboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/retrieve" className={({ isActive }) => isActive ? 'active' : ''}>
            Retrieve
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
            History
          </NavLink>
        </li>
      </ul>

      <div className="navbar-right" />
    </nav>
  );
}
