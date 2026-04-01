import React from "react";
import { FaMoon, FaSun, FaSearch, FaUserCircle } from "react-icons/fa";
import "../navbar.css";

const Navbar = ({ theme, toggleTheme, title }) => {
  return (
    <header className="navbar glass-effect">
      <div className="navbar-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="navbar-right">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>

        <div className="user-profile">
          <FaUserCircle className="profile-icon" />
          <span className="user-name">Vivek</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
