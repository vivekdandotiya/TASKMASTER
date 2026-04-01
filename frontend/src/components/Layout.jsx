import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../layout.css";

const Layout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="main-viewport">
        <Navbar theme={theme} toggleTheme={toggleTheme} title={title} />
        
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
