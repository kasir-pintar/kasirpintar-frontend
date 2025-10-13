import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../services/user';
import { toast } from 'react-toastify';
import UserFormModal from '../../components/UserFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './UserManagementPage.scss';
import { FaPlus, FaUsers, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({ id: decoded.sub, role: decoded.role, outlet_id: decoded.outlet_id });
      } catch (e) { console.error("Invalid Token") }
    }
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error(`Gagal memuat data user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFormModal = (user = null) => {
    setEditingUser(user);
    setFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (formData) => {
    const isEditing = !!editingUser;
    const action = isEditing ? updateUser : createUser;
    const successMessage = isEditing ? 'User berhasil diperbarui!' : 'User baru berhasil ditambahkan!';
    
    try {
      if (isEditing) {
        await action(editingUser.ID, formData);
      } else {
        await action(formData);
      }
      toast.success(successMessage);
      handleCloseFormModal();
      fetchUsers();
    } catch (error) {
      toast.error(`Gagal menyimpan user: ${error}`);
    }
  };

  const handleDeleteRequest = (user) => {
    setUserToDelete(user);
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.ID);
      toast.success(`User "${userToDelete.Name}" berhasil dihapus.`);
      fetchUsers();
    } catch (error) {
      toast.error(`Gagal menghapus user: ${error}`);
    } finally {
      handleCloseConfirmModal();
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.Email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.Role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  
  const isActionDisabled = (targetUser) => {
    if (!currentUser) return true;
    if (targetUser.ID === currentUser.id) return true;
    if (currentUser.role === 'manager' && targetUser.Role !== 'cashier') return true;
    return false;
  };

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>Manajemen User</h1>
        <button className="add-btn" onClick={() => handleOpenFormModal(null)}>
          <FaPlus /> Tambah User Baru
        </button>
      </div>

      <div className="page-content">
        <div className="table-controls">
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama, email, atau peran..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="items-per-page-selector">
            <label htmlFor="items-per-page">Tampilkan:</label>
            <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
          </div>
        </div>

        {loading ? ( <p>Memuat data user...</p> ) 
        : users.length === 0 ? (
          <div className="no-data"><FaUsers /><p>Belum ada user.</p></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th className="column-no">No</th>
                    <th>Nama</th><th>Email</th><th>Peran</th><th>Outlet</th><th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => (
                    <tr key={user.ID}>
                      <td className="column-no">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{user.Name}</td>
                      <td>{user.Email}</td>
                      <td><span className={`role-badge role-${user.Role}`}>{user.Role}</span></td>
                      <td>{user.Outlet?.Name || '-'}</td>
                      <td className="action-cell">
                        <button className="action-btn edit-btn" onClick={() => handleOpenFormModal(user)} disabled={isActionDisabled(user)}>
                          <FaEdit /> Edit
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(user)} disabled={isActionDisabled(user)}>
                          <FaTrash /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="no-data"><p>User tidak ditemukan.</p></div>
              )}
            </div>
            
            <div className="pagination-controls">
              <span>Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}</span>
              <div className="pagination-buttons">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Berikutnya</button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmitUser}
        initialData={editingUser}
        currentUser={currentUser}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${userToDelete?.Name}"?`}
      />
    </div>
  );
}

export default UserManagementPage;