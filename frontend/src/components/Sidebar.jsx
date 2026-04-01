import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCheckSquare, FaStickyNote, FaChartLine, FaWallet, FaSignOutAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../sidebar.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { name: "Tasks", path: "/", icon: <FaCheckSquare /> },
    { name: "Notes", path: "/notes", icon: <FaStickyNote /> },
    { name: "Activity", path: "/calendar", icon: <FaChartLine /> },
    { name: "Expenses", path: "/daily-expense", icon: <FaWallet /> },
  ];

  return (
    <aside className={`sidebar glass-effect ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">TM</div>
          <span className="logo-text">TaskMaster</span>
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><FaSignOutAlt /></span>
          <span className="nav-text">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
