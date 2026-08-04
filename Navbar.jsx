import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { to: '/', label: '🏠 Home' },
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/meal-plans', label: '📅 Meal Plans' },
  { to: '/recipes', label: '👨‍🍳 Recipes' },
  { to: '/inventory', label: '📦 Inventory' },
  { to: '/shopping-list', label: '🛒 Shopping List' },
  { to: '/favorites', label: '❤️ Favorites' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <NavLink to="/" className="logo-link" onClick={closeMenu}>
            🍽️ MealMatch
          </NavLink>
        </div>

        {/* Hamburger Menu */}
        <div
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation Links */}
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

          {/* Divider */}
          <li className="nav-divider"></li>

          {/* User Menu */}
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
