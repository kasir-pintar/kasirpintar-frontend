import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getAllOutlets, createOutlet, updateOutlet, deleteOutlet } from '../../services/outlet';
import OutletFormModal from '../../components/OutletFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FaPlus, FaEdit, FaTrash, FaStoreAlt, FaSearch } from 'react-icons/fa';
import './OutletManagementPage.scss';

function OutletManagementPage() {
    // =========================================
    // BAGIAN STATE
    // =========================================
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // =========================================
    // BAGIAN FETCH DATA
    // =========================================
    const loadOutlets = async () => {
        setLoading(true);
        try {
            const response = await getAllOutlets();
            setOutlets(response || []);
        } catch (error) {
            toast.error("Gagal memuat data outlet.");
            setOutlets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOutlets();
    }, []);

    // =========================================
    // BAGIAN HANDLERS (Create, Update, Delete)
    // =========================================
    const handleOpenForm = (outlet = null) => {
        setSelectedOutlet(outlet);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelectedOutlet(null);
    };

    const handleSave = async (data) => {
        const isEditing = !!selectedOutlet;
        const action = isEditing ? updateOutlet(selectedOutlet.ID, data) : createOutlet(data);
        const message = isEditing ? "Outlet berhasil diperbarui!" : "Outlet berhasil ditambahkan!";

        try {
            await action;
            toast.success(message);
            loadOutlets();
            handleCloseForm();
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal menyimpan outlet.");
        }
    };

    const handleOpenConfirm = (outlet) => {
        setSelectedOutlet(outlet);
        setConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setSelectedOutlet(null);
    };

    const handleDelete = async () => {
        if (!selectedOutlet) return;
        try {
            await deleteOutlet(selectedOutlet.ID);
            toast.success("Outlet berhasil dihapus!");
            loadOutlets();
            handleCloseConfirm();
        } catch (error) {
            toast.error("Gagal menghapus outlet.");
        }
    };

    // =========================================
    // LOGIKA FILTER & PAGINATION (CLIENT-SIDE)
    // =========================================
    const filteredOutlets = useMemo(() => {
        if (!Array.isArray(outlets)) return [];
        return outlets.filter(outlet =>
            (outlet.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (outlet.Address?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (outlet.Phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (outlet.Manager?.Name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [outlets, searchTerm]);

    const paginatedOutlets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOutlets.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOutlets, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredOutlets.length / itemsPerPage);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // =========================================
    // BAGIAN RENDER (JSX)
    // =========================================
    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Manajemen Outlet</h1>
                <button onClick={() => handleOpenForm()} className="add-btn"><FaPlus /> Tambah Outlet</button>
            </header>
            
            <div className="page-content">
                <div className="table-controls">
                    <div className="search-input">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Cari outlet atau manajer..." 
                            value={searchTerm} 
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                        />
                    </div>
                    <div className="items-per-page-selector">
                        <label htmlFor="items-per-page">Tampilkan:</label>
                        <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>

                {loading ? (<p>Memuat data...</p>) 
                    : filteredOutlets.length === 0 ? (
                        <div className="no-data"><FaStoreAlt /><p>Tidak ada outlet yang cocok dengan pencarian Anda.</p></div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Outlet</th>
                                            <th>Alamat</th>
                                            <th>Telepon</th>
                                            <th>Manajer</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedOutlets.map((outlet, index) => (
                                            <tr key={outlet.ID}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td>{outlet.Name}</td>
                                                <td>{outlet.Address}</td>
                                                <td>{outlet.Phone}</td>
                                                <td>{outlet.Manager?.Name || 'N/A'}</td>
                                                <td className="action-cell">
                                                    <button onClick={() => handleOpenForm(outlet)} className="action-btn edit-btn"><FaEdit /> Edit</button>
                                                    <button onClick={() => handleOpenConfirm(outlet)} className="action-btn delete-btn"><FaTrash /> Hapus</button>
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

            {isFormOpen && (
                <OutletFormModal
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSubmit={handleSave}
                    initialData={selectedOutlet}
                />
            )}
            
            {isConfirmOpen && (
                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={handleCloseConfirm}
                    onConfirm={handleDelete}
                    title="Konfirmasi Hapus"
                    message={`Anda yakin ingin menghapus outlet "${selectedOutlet?.Name}"?`}
                />
            )}
        </div>
    );
}

export default OutletManagementPage;