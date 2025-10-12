// LOKASI: src/pages/MenuManagementPage/MenuManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllMenus, createMenu, updateMenu, deleteMenu } from '../../services/menu';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import MenuFormModal from '../../components/MenuFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './MenuManagementPage.scss';
import { FaPlus, FaUtensils, FaEdit, FaTrash } from 'react-icons/fa';

function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await getAllMenus();
      setMenus(data || []);
    } catch (error) {
      toast.error('Gagal memuat data menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenFormModal = (menu = null) => {
    setEditingMenu(menu);
    setFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingMenu(null);
  };

  const handleSubmitMenu = async (formData) => {
    const isEditing = !!editingMenu;
    const action = isEditing ? updateMenu : createMenu;
    const successMessage = isEditing ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!';
    
    try {
      if (isEditing) {
        await action(editingMenu.ID, formData);
      } else {
        await action(formData);
      }
      toast.success(successMessage);
      handleCloseFormModal();
      fetchMenus();
    } catch (error) {
      toast.error(`Gagal menyimpan menu: ${error}`);
    }
  };

  const handleDeleteRequest = (menu) => {
    setMenuToDelete(menu);
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalOpen(false);
    setMenuToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) return;
    try {
      await deleteMenu(menuToDelete.ID);
      toast.success(`Menu "${menuToDelete.Name}" berhasil dihapus.`);
      fetchMenus();
    } catch (error) {
      toast.error(`Gagal menghapus menu: ${error}`);
    } finally {
      handleCloseConfirmModal();
    }
  };

  return (
    <div className="menu-management-container">
      <div className="page-header">
        <h1>Manajemen Menu</h1>
        <button className="add-btn" onClick={() => handleOpenFormModal(null)}>
          <FaPlus /> Tambah Menu Baru
        </button>
      </div>

      <div className="page-content">
        {loading ? ( <p>Memuat data menu...</p> ) 
        : menus.length === 0 ? (
          <div className="no-data"><FaUtensils /><p>Belum ada menu.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="menu-table">
              <thead>
                <tr>
                  {/* --- TAMBAHKAN KOLOM "No" DI SINI --- */}
                  <th className="column-no">No</th>
                  <th>Nama Menu</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* --- TAMBAHKAN 'index' PADA FUNGSI MAP --- */}
                {menus.map((menu, index) => (
                  <tr key={menu.ID}>
                    {/* --- TAMPILKAN NOMOR URUT (index + 1) --- */}
                    <td className="column-no">{index + 1}</td>
                    <td>{menu.Name}</td>
                    <td>{menu.Category || '-'}</td>
                    <td><NumericFormat value={menu.Price} displayType="text" thousandSeparator="." decimalSeparator="," prefix="Rp " /></td>
                    <td>{menu.Stock}</td>
                    <td className="action-cell">
                      <button className="action-btn edit-btn" onClick={() => handleOpenFormModal(menu)}><FaEdit /> Edit</button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(menu)}><FaTrash /> Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <MenuFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmitMenu}
        initialData={editingMenu}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Menu"
        message={`Apakah Anda yakin ingin menghapus menu "${menuToDelete?.Name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}

export default MenuManagementPage;