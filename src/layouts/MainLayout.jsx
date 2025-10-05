// LOKASI: src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaBars } from 'react-icons/fa';
import './MainLayout.scss';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="content-wrapper">
        <header className="topbar">
          <button className="menu-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <span className="topbar-title">KasirPintar</span>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;