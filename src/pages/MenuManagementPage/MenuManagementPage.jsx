// LOKASI: src/pages/MenuManagementPage/MenuManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllMenus, createMenu } from '../../services/menu';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import MenuFormModal from '../../components/MenuFormModal';
import './MenuManagementPage.scss';
import { FaPlus, FaUtensils, FaEdit, FaTrash } from 'react-icons/fa';

function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State 'editingMenu' akan kita gunakan nanti untuk fungsi edit
  const [editingMenu, setEditingMenu] = useState(null); 

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

  const handleOpenModal = () => {
    setEditingMenu(null); // Pastikan mode edit mati saat menambah baru
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
  };

  const handleSubmitMenu = async (formData) => {
    try {
      await createMenu(formData);
      toast.success('Menu baru berhasil ditambahkan!');
      handleCloseModal();
      fetchMenus(); // Muat ulang data menu
    } catch (error) {
      toast.error(`Gagal menyimpan menu: ${error}`);
    }
  };

  return (
    <div className="menu-management-container">
      <div className="page-header">
        <h1>Manajemen Menu</h1>
        <button className="add-btn" onClick={handleOpenModal}>
          <FaPlus /> Tambah Menu Baru
        </button>
      </div>

      <div className="page-content">
        {loading ? (
          <p>Memuat data menu...</p>
        ) : menus.length === 0 ? (
          <div className="no-data">
            <FaUtensils />
            <p>Belum ada menu yang ditambahkan.</p>
          </div>
        ) : (
          <table className="menu-table">
            <thead>
              <tr>
                <th>Nama Menu</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.map(menu => (
                <tr key={menu.ID}>
                  <td>{menu.Name}</td>
                  <td>{menu.Category || '-'}</td>
                  <td>
                    <NumericFormat value={menu.Price} displayType="text" thousandSeparator="." decimalSeparator="," prefix="Rp " />
                  </td>
                  <td>{menu.Stock}</td>
                  <td className="action-cell">
                    <button className="action-btn edit-btn"><FaEdit /> Edit</button>
                    <button className="action-btn delete-btn"><FaTrash /> Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMenu}
        initialData={editingMenu}
      />
    </div>
  );
}

export default MenuManagementPage;