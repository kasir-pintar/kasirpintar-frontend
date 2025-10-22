import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './OutletFormModal.scss';
import { getAvailableManagers } from '../services/user';
// Asumsi Anda sudah punya komponen ini dari fitur hapus
import ConfirmationModal from './ConfirmationModal'; 

function OutletFormModal({ isOpen, onClose, onSubmit, initialData }) {
    // State untuk field input
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});
    const [managers, setManagers] = useState([]);
    const [managerId, setManagerId] = useState('');

    // --- TAMBAHAN: State untuk modal peringatan ---
    const [isWarningOpen, setWarningOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const [warningMessage, setWarningMessage] = useState('');

    // Mengambil daftar manajer dari API saat modal dibuka
    useEffect(() => {
        const fetchManagers = async () => {
            if (isOpen) {
                try {
                    const response = await getAvailableManagers();
                    setManagers(response.data || []);
                } catch (error) {
                    console.error("Gagal memuat daftar manajer", error);
                }
            }
        };
        fetchManagers();
    }, [isOpen]);

    // Mengisi form dengan data awal (untuk mode edit)
    useEffect(() => {
        if (initialData) {
            setName(initialData.Name || '');
            setAddress(initialData.Address || '');
            setPhone(initialData.Phone || '');
            setManagerId(initialData.ManagerID || '');
        } else {
            // Mengosongkan form saat mode tambah
            setName('');
            setAddress('');
            setPhone('');
            setManagerId('');
        }
        setErrors({});
    }, [initialData, isOpen]);

    // Fungsi validasi form
    const validateForm = () => {
        const newErrors = {};
        if (!name) newErrors.name = 'Nama outlet tidak boleh kosong';
        if (!address) newErrors.address = 'Alamat tidak boleh kosong';
        if (!phone) {
            newErrors.phone = 'Nomor telepon tidak boleh kosong';
        } else if (!/^[0-9]+$/.test(phone)) {
            newErrors.phone = 'Nomor telepon hanya boleh berisi angka';
        }
        return newErrors;
    };

    // Fungsi yang dijalankan saat tombol "Simpan" ditekan
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const dataToSubmit = {
            Name: name,
            Address: address,
            Phone: phone,
            ManagerID: managerId ? parseInt(managerId, 10) : null
        };

        if (managerId) {
            const selectedManager = managers.find(m => m.ID == managerId);
            if (selectedManager && selectedManager.OutletID > 0 && selectedManager.OutletID !== initialData?.ID) {
                // Siapkan data dan pesan, lalu buka modal peringatan
                setFormData(dataToSubmit);
                setWarningMessage(
                    `Manajer "${selectedManager.Name}" sudah bertugas di outlet lain. Yakin ingin melanjutkan?`
                );
                setWarningOpen(true);
                return; // Hentikan proses submit di sini
            }
        }
        
        // Jika tidak ada masalah, langsung kirim data
        onSubmit(dataToSubmit);
    };

    // Fungsi baru yang dijalankan setelah konfirmasi
    const handleConfirmSubmit = () => {
        if (formData) {
            onSubmit(formData); // Kirim data yang sudah disiapkan
        }
        setWarningOpen(false); // Tutup modal peringatan
    };


    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>{initialData ? 'Edit Outlet' : 'Tambah Outlet Baru'}</h2>
                        <button onClick={onClose} className="close-button"><FaTimes /></button>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                        <div className="modal-body">
                            {/* Form group untuk Nama Outlet */}
                            <div className="form-group">
                                <label>Nama Outlet</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && <p className="error-message">{errors.name}</p>}
                            </div>

                            {/* Form group untuk Alamat */}
                            <div className="form-group">
                                <label>Alamat</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {errors.address && <p className="error-message">{errors.address}</p>}
                            </div>

                            {/* Form group untuk Nomor Telepon */}
                            <div className="form-group">
                                <label>Nomor Telepon</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                {errors.phone && <p className="error-message">{errors.phone}</p>}
                            </div>

                            {/* Dropdown untuk memilih manajer */}
                            <div className="form-group">
                                <label>Manajer Outlet (Opsional)</label>
                                <select
                                    value={managerId}
                                    onChange={(e) => setManagerId(e.target.value)}
                                >
                                    <option value="">-- Tidak Ada Manajer --</option>
                                    {managers.map(manager => (
                                        <option key={manager.ID} value={manager.ID}>
                                            {manager.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn-submit">
                                <FaSave /> {initialData ? 'Simpan Perubahan' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Render komponen ConfirmationModal untuk peringatan */}
            {isWarningOpen && (
                <ConfirmationModal
                    isOpen={isWarningOpen}
                    onClose={() => setWarningOpen(false)}
                    onConfirm={handleConfirmSubmit}
                    title="Konfirmasi Penugasan"
                    message={warningMessage}
                />
            )}
        </>
    );
}

export default OutletFormModal;