// LOKASI: src/pages/ProfilePage/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { changePassword } from '../../services/user';
import { FaUserCircle } from 'react-icons/fa';
import './ProfilePage.scss';

function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Kita ambil semua data yang kita butuhkan dari token
        setCurrentUser({
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          outletName: decoded.outlet_name || 'N/A', // Ambil nama outlet jika ada
        });
      } catch (e) {
        console.error("Token tidak valid");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal harus 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success(response.message || "Password berhasil diubah!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>Profil Saya</h1>
      </div>
      <div className="profile-grid">
        {/* Kolom Kiri: Informasi Pengguna */}
        <div className="profile-info-card">
          <FaUserCircle className="profile-avatar" />
          <h2 className="profile-name">{currentUser?.name}</h2>
          <p className="profile-email">{currentUser?.email}</p>
          <div className="profile-details">
            <div className="detail-item">
              <span>Peran</span>
              <strong><span className={`role-badge role-${currentUser?.role}`}>{currentUser?.role}</span></strong>
            </div>
            <div className="detail-item">
              <span>Outlet</span>
              <strong>{currentUser?.outletName}</strong>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Aksi Pengguna */}
        <div className="profile-actions">
          <div className="change-password-card">
            <h3>Ubah Password</h3>
            <p>Untuk keamanan, gunakan password yang kuat dan unik.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="current-password">Password Saat Ini</label>
                <input type="password" id="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">Password Baru</label>
                <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Konfirmasi Password Baru</label>
                <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Perbarui Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;