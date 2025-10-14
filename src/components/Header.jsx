// LOKASI: src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUserCircle, FaSignOutAlt, FaUserEdit, FaBars } from 'react-icons/fa';
import './Header.scss';

function Header({ toggleSidebar }) {
  const [userName, setUserName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || 'Pengguna');
      } catch (error) {
        console.error("Token tidak valid:", error);
      }
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        
        <div className="user-menu" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="user-menu-button">
            <FaUserCircle className="user-icon" />
            <span className="user-name">{userName}</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <FaUserEdit /> Profil
              </Link>
              <button onClick={handleLogout} className="dropdown-item">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;