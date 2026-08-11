import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: '🏠 Home' },
    ...(user
      ? [
          { to: '/dashboard', label: '📊 Dashboard' },
          { to: '/meal-plans', label: '📅 Meal Plans' },
          { to: '/recipes', label: '👨‍🍳 Recipes' },
          { to: '/inventory', label: '📦 Inventory' },
          { to: '/shopping-list', label: '🛒 Shopping List' },
          { to: '/favorites', label: '❤️ Favorites' },
        ]
      : []),
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <NavLink to="/" className="logo-link" onClick={closeMenu}>
            🍽️ MealMatch
          </NavLink>
        </div>

        <div
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            </li>
          ))}

          <li className="nav-divider"></li>

          {user ? (
            <>
              <li className="nav-item">
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
                  onClick={closeMenu}
                >
                  👤 Profile
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/logout"
                  className={({ isActive }) => `nav-link logout-link ${isActive ? 'active' : ''}`.trim()}
                  onClick={closeMenu}
                >
                  🚪 Logout
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
                  onClick={closeMenu}
                >
                  🔐 Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/register"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
                  onClick={closeMenu}
                >
                  ✍️ Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
