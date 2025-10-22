import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllOutlets, createOutlet, updateOutlet, deleteOutlet } from '../../services/outlet';
import OutletFormModal from '../../components/OutletFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FaPlus, FaEdit, FaTrash, FaStoreAlt } from 'react-icons/fa';
import './OutletManagementPage.scss';

function OutletManagementPage() {
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    const loadOutlets = async () => {
        setLoading(true);
        try {
            const response = await getAllOutlets();
            // 'response' adalah { data: [...] }
            // 'response.data' adalah array [...]
            setOutlets(response.data || []); // Benar: akses .data sekali saja
        } catch (error) {
            toast.error("Gagal memuat data outlet.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOutlets();
    }, []);

    const handleOpenForm = (outlet = null) => {
        setSelectedOutlet(outlet);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelectedOutlet(null);
    };

    const handleSave = async (data) => {
        const action = selectedOutlet ? updateOutlet(selectedOutlet.ID, data) : createOutlet(data);
        const message = selectedOutlet ? "Outlet berhasil diperbarui!" : "Outlet berhasil ditambahkan!";

        try {
            await action;
            toast.success(message);
            loadOutlets();
            handleCloseForm();
        } catch (error) {
            toast.error("Gagal menyimpan outlet.");
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
        try {
            await deleteOutlet(selectedOutlet.ID);
            toast.success("Outlet berhasil dihapus!");
            loadOutlets();
            handleCloseConfirm();
        } catch (error) {
            toast.error("Gagal menghapus outlet.");
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Manajemen Outlet</h1>
                <button onClick={() => handleOpenForm()} className="add-btn"><FaPlus /> Tambah Outlet</button>
            </header>

            <div className="page-content">
                {loading ? <p>Memuat data...</p> : outlets.length === 0 ? (
                    <div className="no-data">
                        <FaStoreAlt />
                        <p>Belum ada data outlet. Silakan tambahkan outlet baru.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama Outlet</th>
                                <th>Alamat</th>
                                <th>Telepon</th>
                                <th>Manajer</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {outlets.map(outlet => (
                                <tr key={outlet.ID}>
                                    <td>{outlet.Name}</td>      {/* <-- Ubah n menjadi N */}
                                    <td>{outlet.Address}</td>  {/* <-- Ubah a menjadi A */}
                                    <td>{outlet.Phone}</td>    {/* <-- Ubah p menjadi P */}
                                    <td>{outlet.Manager?.Name || 'N/A'}</td>
                                    <td className="action-cell">
                                        <button onClick={() => handleOpenForm(outlet)} className="action-btn edit-btn"><FaEdit /></button>
                                        <button onClick={() => handleOpenConfirm(outlet)} className="action-btn delete-btn"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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