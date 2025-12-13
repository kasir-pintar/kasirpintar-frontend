// LOKASI: src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
  FaTachometerAlt, 
  FaHistory, 
  FaLightbulb, 
  FaChartLine,
  FaTags, 
  FaUtensils, 
  FaUsers, 
  FaStoreAlt,
  FaSignOutAlt, 
  FaTimes,
  FaUserEdit,
  FaMoneyBillWave // <- tambahkan ini
} from 'react-icons/fa';
import './Sidebar.scss';

function Sidebar({ isOpen, toggle }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Fungsi untuk menutup sidebar saat link di-klik (berguna di mobile)
  const handleLinkClick = () => {
    if (isOpen) {
      toggle();
    }
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>KasirPintar</h3>
          <button className="close-btn" onClick={toggle}><FaTimes /></button>
        </div>
        <nav className="sidebar-nav">
          {/* --- MENU LEVEL MANAGER KE ATAS (branch_manager, owner, admin) --- */}
          {(userRole === 'admin' || userRole === 'owner' || userRole === 'branch_manager') && (
            <>
              <NavLink to="/dashboard" end onClick={handleLinkClick}><FaTachometerAlt /> Dashboard</NavLink>
              <NavLink to="/users" onClick={handleLinkClick}><FaUsers /> Manajemen Staf</NavLink>
              <NavLink to="/management/menus" onClick={handleLinkClick}><FaUtensils /> Manajemen Menu</NavLink>
              <NavLink to="/promotions" onClick={handleLinkClick}><FaTags /> Manajemen Promosi</NavLink>
              <NavLink to="/analytics" onClick={handleLinkClick}><FaLightbulb /> Analitik</NavLink>
              <NavLink to="/reports" onClick={handleLinkClick}><FaChartLine /> Laporan</NavLink>
              <NavLink to="/transactions" onClick={handleLinkClick}><FaHistory /> Riwayat Transaksi</NavLink>
            </>
          )}

          {/* --- MENU LEVEL OWNER KE ATAS (owner, admin) --- */}
          {(userRole === 'admin' || userRole === 'owner') && (
            <>
              <NavLink to="/outlets" onClick={handleLinkClick}>
                <FaStoreAlt /> Manajemen Outlet
              </NavLink>

              {/* === NEW: Pajak === */}
              <NavLink to="/tax" onClick={handleLinkClick}>
                <FaMoneyBillWave /> Pajak
              </NavLink>
            </>
          )}

          {/* --- MENU BERSAMA UNTUK SEMUA PERAN YANG LOGIN --- */}
          <NavLink to="/profile" onClick={handleLinkClick}><FaUserEdit /> Profil Saya</NavLink>
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
