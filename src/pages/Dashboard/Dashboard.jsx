// LOKASI: src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.scss'; // <-- Import file SCSS

function DashboardPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      <main className="dashboard-content">
        <h2>Selamat Datang, {userRole}!</h2>
        <p>Ini adalah halaman utama untuk manajemen. Dari sini Anda bisa mengakses berbagai fitur.</p>
        <nav className="dashboard-nav">
          <ul>
            {/* Link ini muncul untuk semua (admin & manager) */}
            <li><Link to="/transactions">Lihat Riwayat Transaksi</Link></li>

            {/* Link ini HANYA muncul jika peran adalah 'admin' */}
            {userRole === 'admin' && (
              <li><Link to="/admin/users">Manajemen Pengguna</Link></li>
            )}
          </ul>
        </nav>
      </main>
    </div>
  );
}

export default DashboardPage;