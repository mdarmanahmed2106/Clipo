import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <Logo size={36} />
          Clipo
        </Link>
      </div>

      <button 
        className="navbar-mobile-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`navbar-nav ${isMenuOpen ? 'open' : ''}`}>
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

