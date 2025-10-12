// LOKASI: src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaHistory, 
  FaLightbulb, 
  FaChartLine,
  FaTags,
  FaUtensils, // <-- IKON BARU
  FaSignOutAlt, 
  FaTimes 
} from 'react-icons/fa';
import './Sidebar.scss';

function Sidebar({ isOpen, toggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>KasirPintar</h3>
          <button className="close-btn" onClick={toggle}><FaTimes /></button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end onClick={toggle}><FaTachometerAlt /> Dashboard</NavLink>
          
          {/* --- MENU BARU DI SINI --- */}
          <NavLink to="/management/menus" onClick={toggle}><FaUtensils /> Manajemen Menu</NavLink>
          
          <NavLink to="/promotions" onClick={toggle}><FaTags /> Manajemen Promosi</NavLink>
          <NavLink to="/transactions" onClick={toggle}><FaHistory /> Riwayat Transaksi</NavLink>
          <NavLink to="/analytics" onClick={toggle}><FaLightbulb /> Prediksi Penjualan</NavLink>
          <NavLink to="/reports" onClick={toggle}><FaChartLine /> Laporan Operasional</NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={toggle}></div>}
    </>
  );
}

export default Sidebar;