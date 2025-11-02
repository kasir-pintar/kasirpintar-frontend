// LOKASI: src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaBars } from 'react-icons/fa';
import './MainLayout.scss';

// --- 🛑 TAMBAHKAN IMPORT INI 🛑 ---
import { jwtDecode } from 'jwt-decode';

// --- 🛑 TAMBAHKAN FUNGSI HELPER INI 🛑 ---
// Fungsi untuk mengambil role dari token
const getUserRole = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    // Pastikan field 'role' di token Anda sudah benar
    return jwtDecode(token).role; 
  } catch (e) {
    console.error("Token tidak valid:", e);
    return null;
  }
};


function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- 🛑 TAMBAHKAN LOGIKA PENGECEKAN ROLE INI 🛑 ---
  const userRole = getUserRole();
  const isCashier = userRole === 'cashier';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // --- 🛑 PERBAIKI LOGIKA RETURN-NYA 🛑 ---
  // Jika role-nya adalah kasir, render HANYA halamannya (Outlet)
  // Ini akan membuat <TransactionHistoryPage> tampil fullscreen.
  if (isCashier) {
    return <Outlet />;
  }

  // Jika BUKAN kasir (admin, owner, manager),
  // render layout lengkap dengan sidebar dan topbar.
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