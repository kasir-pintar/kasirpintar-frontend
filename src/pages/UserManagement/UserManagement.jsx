// LOKASI: src/pages/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUsers } from '../../services/admin';
import './UserManagement.scss'; // <-- Import file SCSS

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data || []);
      } catch (err) {
        setError("Gagal memuat data pengguna.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="page-container">
      <Link to="/dashboard" className="back-link">{'< Kembali ke Dashboard'}</Link>
      <h1 className="page-title">Manajemen Pengguna</h1>

      {loading && <p>Memuat data...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Outlet ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.ID}>
                  <td>{user.Name}</td>
                  <td>{user.Email}</td>
                  <td>{user.Role}</td>
                  <td>{user.OutletID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;