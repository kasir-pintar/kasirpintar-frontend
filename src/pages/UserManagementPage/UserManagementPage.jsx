// LOKASI: src/pages/UserManagementPage/UserManagementPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAllUsers, getArchivedUsers, createUser, updateUser, deleteUser, restoreUser, permanentDeleteUser } from '../../services/user';
import { toast } from 'react-toastify';
import UserFormModal from '../../components/UserFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './UserManagementPage.scss';
import { FaPlus, FaUsers, FaEdit, FaTrash, FaSearch, FaArchive, FaTrashRestore, FaExclamationTriangle } from 'react-icons/fa';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToAction, setUserToAction] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('active');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({ id: decoded.sub, role: decoded.role, outlet_id: decoded.outlet_id });
      } catch (e) { console.error("Invalid Token") }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [view, currentUser]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = view === 'active' ? await getAllUsers() : await getArchivedUsers();
      setUsers(data || []);
    } catch (error) {
      const errorMsg = view === 'active' ? 'Gagal memuat data user' : 'Gagal memuat arsip user';
      toast.error(`${errorMsg}: ${error}`);
      setUsers([]);
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
    setUserToAction(user);
    setActionType('delete');
    setConfirmModalOpen(true);
  };

  const handleRestoreRequest = (user) => {
    setUserToAction(user);
    setActionType('restore');
    setConfirmModalOpen(true);
  };

  const handlePermanentDeleteRequest = (user) => {
    setUserToAction(user);
    setActionType('permanent-delete');
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setUserToAction(null);
    setActionType('');
  };

  const handleConfirmAction = async () => {
    if (!userToAction) return;
    try {
      if (actionType === 'delete') {
        await deleteUser(userToAction.ID);
        toast.success(`User "${userToAction.Name}" berhasil dinonaktifkan.`);
      } else if (actionType === 'restore') {
        await restoreUser(userToAction.ID);
        toast.success(`User "${userToAction.Name}" berhasil diaktifkan kembali.`);
      } else if (actionType === 'permanent-delete') {
        await permanentDeleteUser(userToAction.ID);
        toast.success(`User "${userToAction.Name}" telah dihapus permanen.`);
      }
      fetchUsers();
    } catch (error) {
      let errorMsg = 'Aksi gagal';
      if (actionType === 'delete') errorMsg = 'Gagal menonaktifkan user';
      if (actionType === 'restore') errorMsg = 'Gagal mengaktifkan user';
      if (actionType === 'permanent-delete') errorMsg = 'Gagal menghapus permanen user';
      toast.error(`${errorMsg}: ${error}`);
    } finally {
      handleCloseConfirmModal();
    }
  };

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(user =>
      (user.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.Email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
  
  const toggleView = () => {
    setView(prev => prev === 'active' ? 'archived' : 'active');
    setCurrentPage(1);
    setSearchTerm('');
  };

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>{view === 'active' ? 'Manajemen User' : 'Arsip User'}</h1>
        <div className="header-actions">
          <button className="view-toggle-btn" onClick={toggleView}>
            {view === 'active' ? <><FaArchive /> Lihat Arsip</> : <><FaUsers /> Lihat User Aktif</>}
          </button>
          <button className="add-btn" onClick={() => handleOpenFormModal(null)} disabled={view === 'archived'}>
            <FaPlus /> Tambah User Baru
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="table-controls">
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="items-per-page-selector">
            <label htmlFor="items-per-page">Tampilkan:</label>
            <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
          </div>
        </div>

        {loading ? ( <p>Memuat data...</p> ) 
        : filteredUsers.length === 0 ? (
          <div className="no-data"><FaUsers /><p>{view === 'active' ? 'Belum ada user aktif.' : 'Arsip kosong.'}</p></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th className="column-no">No</th><th>Nama</th><th>Email</th><th>Peran</th><th>Outlet</th><th>Aksi</th>
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
                        {view === 'active' ? (
                          <>
                            <button className="action-btn edit-btn" onClick={() => handleOpenFormModal(user)} disabled={isActionDisabled(user)}>
                              <FaEdit /> Edit
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(user)} disabled={isActionDisabled(user)}>
                              <FaTrash /> Nonaktifkan
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="action-btn restore-btn" onClick={() => handleRestoreRequest(user)}>
                              <FaTrashRestore /> Aktifkan
                            </button>
                            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                              <button className="action-btn permanent-delete-btn" onClick={() => handlePermanentDeleteRequest(user)}>
                                <FaExclamationTriangle /> Hapus Permanen
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      
      <UserFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSubmit={handleSubmitUser} initialData={editingUser} currentUser={currentUser} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} onConfirm={handleConfirmAction} title={`Konfirmasi Aksi`}
        message={
          actionType === 'delete' ? `Apakah Anda yakin ingin menonaktifkan user "${userToAction?.Name}"?`
          : actionType === 'restore' ? `Apakah Anda yakin ingin mengaktifkan kembali user "${userToAction?.Name}"?`
          : `PERINGATAN: Aksi ini tidak dapat dibatalkan. Anda akan menghapus user "${userToAction?.Name}" dan semua data transaksinya secara permanen. Lanjutkan?`
        }
      />
    </div>
  );
}

export default UserManagementPage;