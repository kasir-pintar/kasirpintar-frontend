// LOKASI: src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import './Login.scss';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Tambahan untuk loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Mulai loading

    try {
      const response = await api.post('/login', { email, password });
      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;

        // --- PERBAIKAN UTAMA DI SINI ---
        // Mengganti if/else dengan switch yang lebih jelas
        switch (userRole) {
          case 'admin':
          case 'owner':
          case 'branch_manager':
            navigate('/dashboard');
            break;
          case 'cashier':
            navigate('/cashier');
            break;
          default:
            // Fallback jika ada peran yang tidak dikenali
            navigate('/');
            break;
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Email atau password salah.';
      setError(errorMessage);
    } finally {
      setLoading(false); // Selesai loading, baik berhasil maupun gagal
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
          <div className="forgot-link-row">
            <Link to="/forgot-password" className="forgot-link">Lupa Password?</Link>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
        
        <Link to="/" className="back-link">Kembali ke Halaman Utama</Link>
      </div>
    </div>
  );
}

export default LoginPage;