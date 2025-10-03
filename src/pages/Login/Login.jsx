// LOKASI: src/pages/Login/Login.jsx
import React, { useState } from 'react';
// Import 'Link' dari react-router-dom
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import './Login.scss';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        if (userRole === 'admin' || userRole === 'manager') {
          navigate('/dashboard');
        } else {
          navigate('/cashier');
        }
      }
    } catch (err) {
      setError('Email atau password salah.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>KasirPintar</h2>
        <p>Silakan login untuk melanjutkan</p>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Login</button>
        </form>
        
        {/* --- TOMBOL KEMBALI DITAMBAHKAN DI SINI --- */}
        <Link to="/" className="back-link">Kembali ke Halaman Utama</Link>

      </div>
    </div>
  );
}

export default LoginPage;