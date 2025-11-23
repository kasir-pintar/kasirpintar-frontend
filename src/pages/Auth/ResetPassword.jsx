import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Auth.scss';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get('token') || '';
    const e = searchParams.get('email') || '';
    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset-password', { token, email, new_password: newPassword });
      toast.success('Password berhasil diubah. Silakan login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal mereset password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p>Masukkan password baru untuk akun: <strong>{email}</strong></p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Password Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="input-group">
            <label>Konfirmasi Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Ubah Password'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}
