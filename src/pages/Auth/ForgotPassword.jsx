import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.scss';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/forgot-password', { email });
      toast.success('Jika email terdaftar, instruksi reset telah dikirim.');
      // Optionally navigate to login
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal mengirim instruksi reset';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Lupa Password</h2>
        <p>Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Instruksi'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
