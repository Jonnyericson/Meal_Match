import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/dashboard');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (link) => {
    setActiveLink(link);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="/" className="logo-link">
            🍽️ MealMatch
          </a>
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
          <li className="nav-item">
            <a
              href="/dashboard"
              className={`nav-link ${activeLink === '/dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('/dashboard')}
            >
              📊 Dashboard
            </a>
          </li>

          <li className="nav-item">
            <a
              href="/meal-plans"
              className={`nav-link ${activeLink === '/meal-plans' ? 'active' : ''}`}
              onClick={() => handleNavClick('/meal-plans')}
            >
              📅 Meal Plans
            </a>
          </li>

          <li className="nav-item">
            <a
              href="/recipes"
              className={`nav-link ${activeLink === '/recipes' ? 'active' : ''}`}
              onClick={() => handleNavClick('/recipes')}
            >
              👨‍🍳 Recipes
            </a>
          </li>

          <li className="nav-item">
            <a
              href="/inventory"
              className={`nav-link ${activeLink === '/inventory' ? 'active' : ''}`}
              onClick={() => handleNavClick('/inventory')}
            >
              📦 Inventory
            </a>
          </li>

          <li className="nav-item">
            <a
              href="/shopping-list"
              className={`nav-link ${activeLink === '/shopping-list' ? 'active' : ''}`}
              onClick={() => handleNavClick('/shopping-list')}
            >
              🛒 Shopping List
            </a>
          </li>

          <li className="nav-item">
            <a
              href="/favorites"
              className={`nav-link ${activeLink === '/favorites' ? 'active' : ''}`}
              onClick={() => handleNavClick('/favorites')}
            >
              ❤️ Favorites
            </a>
          </li>

          {/* Divider */}
          <li className="nav-divider"></li>

          {/* User Menu */}
          <li className="nav-item">
            <a
              href="/profile"
              className={`nav-link ${activeLink === '/profile' ? 'active' : ''}`}
              onClick={() => handleNavClick('/profile')}
            >
              👤 Profile
            </a>
          </li>

          <li className="nav-item">
            <a
              href="/logout"
              className="nav-link logout-link"
              onClick={() => handleNavClick('/logout')}
            >
              🚪 Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
