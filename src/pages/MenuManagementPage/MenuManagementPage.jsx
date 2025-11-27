import React, { useState, useEffect, useMemo } from 'react';
import { getAllMenus, createMenu, updateMenu, deleteMenu } from '../../services/menu';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import { jwtDecode } from 'jwt-decode'; // Pastikan library ini sudah diinstall
import MenuFormModal from '../../components/MenuFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './MenuManagementPage.scss';
import { FaPlus, FaUtensils, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

function MenuManagementPage() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [error, setError] = useState('');
    
    // State untuk menyimpan role user saat ini
    const [userRole, setUserRole] = useState('');

    // 1. Ambil Role User dari Token saat halaman dimuat
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role || '');
            } catch (e) {
                console.error("Token invalid");
            }
        }
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getAllMenus();
            // Backend mengembalikan { data: [...] }
            setMenus(response.data || []);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Terjadi kesalahan";
            setError(`Gagal memuat data menu: ${errorMessage}`);
            toast.error(`Gagal memuat data menu: ${errorMessage}`);
            setMenus([]);
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
            toast.error(`Gagal menyimpan menu: ${error.response?.data?.error || error.message || 'Error tidak diketahui'}`);
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
            toast.error(`Gagal menghapus menu: ${error.response?.data?.error || error.message || 'Error tidak diketahui'}`);
        } finally {
            handleCloseConfirmModal();
        }
    };

    const filteredMenus = useMemo(() => {
        if (!Array.isArray(menus)) return [];
        return menus.filter(menu =>
            (menu.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (menu.Category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            // Opsional: Cari berdasarkan outlet juga jika kolomnya tampil
            (menu.Outlet?.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [menus, searchTerm]);

    const paginatedMenus = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMenus.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMenus, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Helper boolean untuk cek apakah user adalah Owner/Admin
    const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

    return (
        <div className="menu-management-container">
            <div className="page-header">
                <h1>Manajemen Menu</h1>
                
                {/* 2. Tombol Tambah Menu: HANYA untuk Owner/Admin */}
                {isOwnerOrAdmin && (
                    <button className="add-btn" onClick={() => handleOpenFormModal(null)}>
                        <FaPlus /> Tambah Menu Baru
                    </button>
                )}
            </div>

            <div className="page-content">
                <div className="table-controls">
                    <div className="search-input">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cari menu..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="items-per-page-selector">
                        <label htmlFor="items-per-page">Tampilkan:</label>
                        <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                {loading ? ( <p className='loading-text'>Memuat data menu...</p> )
                : error ? ( <p className="error-message">{error}</p> )
                : !Array.isArray(menus) || menus.length === 0 ? (
                    <div className="no-data"><FaUtensils /><p>Belum ada menu di outlet ini.</p></div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="menu-table">
                                <thead>
                                    <tr>
                                        <th className="column-no">No</th>
                                        <th>Nama Menu</th>
                                        <th>Kategori</th>
                                        
                                        {/* 3. Header Kolom Outlet: HANYA untuk Owner/Admin */}
                                        {isOwnerOrAdmin && (
                                            <th>Outlet</th>
                                        )}

                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedMenus.length > 0 ? (
                                        paginatedMenus.map((menu, index) => (
                                            <tr key={menu.ID}>
                                                <td className="column-no">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td>{menu.Name}</td>
                                                <td>{menu.Category || '-'}</td>
                                                
                                                {/* 4. Data Kolom Outlet: HANYA untuk Owner/Admin */}
                                                {isOwnerOrAdmin && (
                                                    <td>
                                                        <span className="outlet-badge">
                                                            {menu.Outlet?.Name || 'N/A'}
                                                        </span>
                                                    </td>
                                                )}

                                                <td><NumericFormat value={menu.Price} displayType="text" thousandSeparator="." decimalSeparator="," prefix="Rp " /></td>
                                                <td>{menu.Stock}</td>
                                                <td className="action-cell">
                                                    {/* Semua role (Manager & Owner) boleh klik Edit */}
                                                    {/* Nanti di dalam Modal, field yang bisa diedit akan dibatasi */}
                                                    <button className="action-btn edit-btn" onClick={() => handleOpenFormModal(menu)}>
                                                        <FaEdit /> Edit
                                                    </button>
                                                    
                                                    {/* 5. Tombol Hapus: HANYA untuk Owner/Admin */}
                                                    {isOwnerOrAdmin && (
                                                        <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(menu)}>
                                                            <FaTrash /> Hapus
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            {/* Sesuaikan colspan agar tampilan tetap rapi */}
                                            <td colSpan={isOwnerOrAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '20px' }}>
                                                Menu tidak ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredMenus.length > 0 && (
                            <div className="pagination-controls">
                                <span>Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}</span>
                                <div className="pagination-buttons">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        Sebelumnya
                                    </button>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                                        Berikutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 6. Kirim prop userRole ke Modal */}
            <MenuFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSubmit={handleSubmitMenu}
                initialData={editingMenu}
                userRole={userRole} 
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus Menu"
                message={`Apakah Anda yakin ingin menghapus menu "${menuToDelete?.Name}"?`}
            />
        </div>
    );
}

export default MenuManagementPage;