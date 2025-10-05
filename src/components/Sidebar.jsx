// LOKASI: src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaHistory, FaBoxOpen, FaSignOutAlt, FaTimes } from 'react-icons/fa';
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
          <NavLink to="/transactions" onClick={toggle}><FaHistory /> Riwayat Transaksi</NavLink>
          {/* <NavLink to="/management/menus" onClick={toggle}><FaBoxOpen /> Manajemen Menu</NavLink> */}
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