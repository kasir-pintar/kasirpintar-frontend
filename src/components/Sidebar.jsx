// LOKASI: src/components/Sidebar/Sidebar.jsx
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
  // FaStoreAlt, // <-- DIHAPUS UNTUK SEMENTARA
  FaSignOutAlt, 
  FaTimes 
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

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>KasirPintar</h3>
          <button className="close-btn" onClick={toggle}><FaTimes /></button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end onClick={toggle}><FaTachometerAlt /> Dashboard</NavLink>
          
          {(userRole === 'admin' || userRole === 'manager') && (
            <NavLink to="/management/menus" onClick={toggle}><FaUtensils /> Manajemen Menu</NavLink>
          )}
          
          {(userRole === 'admin' || userRole === 'manager') && (
            <NavLink to="/promotions" onClick={toggle}><FaTags /> Manajemen Promosi</NavLink>
          )}
          
          <NavLink to="/transactions" onClick={toggle}><FaHistory /> Riwayat Transaksi</NavLink>
          
          {(userRole === 'admin' || userRole === 'manager') && (
             <NavLink to="/analytics" onClick={toggle}><FaLightbulb /> Prediksi Penjualan</NavLink>
          )}
         
          {(userRole === 'admin' || userRole === 'manager') && (
            <NavLink to="/reports" onClick={toggle}><FaChartLine /> Laporan Operasional</NavLink>
          )}
          
          {(userRole === 'admin' || userRole === 'manager') && (
            <NavLink to="/admin/users" onClick={toggle}><FaUsers /> Manajemen User</NavLink>
          )}

          {/* {userRole === 'admin' && (
            <NavLink to="/admin/outlets" onClick={toggle}><FaStoreAlt /> Manajemen Outlet</NavLink>
          )} */} {/* <-- DIHAPUS UNTUK SEMENTARA */}
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