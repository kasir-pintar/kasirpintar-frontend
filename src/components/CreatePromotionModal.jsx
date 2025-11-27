import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { jwtDecode } from 'jwt-decode';
import { getAllOutlets } from '../services/outlet';
import { createPromotion } from '../services/promotion';
import { toast } from 'react-toastify';
import './CreatePromotionModal.scss'; // Kita akan buat file SCSS ini mirip MenuFormModal

Modal.setAppElement('#root');

function CreatePromotionModal({ isOpen, onClose, onPromotionCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'PERCENTAGE', // Default
        value: '',
        start_date: new Date(),
        end_date: new Date(),
        voucher_qty: ''
    });

    // State Multi-Outlet (Owner Only)
    const [outlets, setOutlets] = useState([]);
    const [selectedOutlets, setSelectedOutlets] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Cek Role
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role || '');
            } catch (e) { console.error("Token invalid"); }
        }
    }, []);

    // 2. Fetch Outlet jika Owner
    useEffect(() => {
        if (isOpen && (userRole === 'owner' || userRole === 'admin')) {
            const fetchOutlets = async () => {
                try {
                    const data = await getAllOutlets();
                    setOutlets(data || []);
                } catch (err) { console.error(err); }
            };
            fetchOutlets();
        }
    }, [isOpen, userRole]);

    // 3. Reset Form
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '', description: '', type: 'PERCENTAGE', value: '',
                start_date: new Date(), end_date: new Date(), voucher_qty: ''
            });
            setSelectedOutlets([]);
            setIsAllSelected(false);
        }
    }, [isOpen]);

    // Handler Checkbox
    const handleOutletToggle = (id) => {
        if (selectedOutlets.includes(id)) {
            setSelectedOutlets(prev => prev.filter(oid => oid !== id));
            setIsAllSelected(false);
        } else {
            setSelectedOutlets(prev => [...prev, id]);
        }
    };

    const handleSelectAll = () => {
        if (isAllSelected) setSelectedOutlets([]);
        else setSelectedOutlets(outlets.map(o => o.ID));
        setIsAllSelected(!isAllSelected);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value),
                voucher_qty: parseInt(formData.voucher_qty, 10),
                start_date: formData.start_date.toISOString(),
                end_date: formData.end_date.toISOString(),
            };

            // Validasi Owner
            if (userRole === 'owner' || userRole === 'admin') {
                if (selectedOutlets.length === 0) {
                    toast.warn("Mohon pilih setidaknya satu outlet.");
                    setLoading(false);
                    return;
                }
                payload.outlet_ids = selectedOutlets;
            }

            await createPromotion(payload);
            onPromotionCreated(); // Refresh parent & show toast
            onClose();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Gagal membuat promosi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="promo-form-modal"
            overlayClassName="promo-form-modal-overlay"
        >
            <h2>Buat Promosi Baru</h2>
            <form onSubmit={handleSubmit} className="promo-form">
                
                <div className="form-group">
                    <label>Nama Promosi</label>
                    <input name="name" value={formData.name} onChange={handleChange} required placeholder="Contoh: Diskon Akhir Tahun" />
                </div>

                <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="2" />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Jenis Promosi</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="PERCENTAGE">Persentase (%)</option>
                            <option value="FIXED_AMOUNT">Potongan Tetap (Rp)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Nilai ({formData.type === 'PERCENTAGE' ? '%' : 'Rp'})</label>
                        <input type="number" name="value" value={formData.value} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Tanggal Mulai</label>
                        <DatePicker 
                            selected={formData.start_date} 
                            onChange={date => setFormData({...formData, start_date: date})} 
                            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" 
                            className="date-picker-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tanggal Berakhir</label>
                        <DatePicker 
                            selected={formData.end_date} 
                            onChange={date => setFormData({...formData, end_date: date})} 
                            showTimeSelect dateFormat="dd/MM/yyyy HH:mm" 
                            className="date-picker-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Jumlah Voucher (Qty)</label>
                    <input type="number" name="voucher_qty" value={formData.voucher_qty} onChange={handleChange} required placeholder="Contoh: 100" />
                </div>

                {/* --- CHECKBOX MULTI-OUTLET (Copy dari MenuForm) --- */}
                {(userRole === 'owner' || userRole === 'admin') && (
                    <div className="form-group outlet-selection-group">
                        <label style={{marginBottom: '8px', display: 'block'}}>Pilih Outlet Target:</label>
                        <div className="outlet-list-container">
                            <div className="outlet-item select-all">
                                <input type="checkbox" id="promo-select-all" checked={isAllSelected} onChange={handleSelectAll} />
                                <label htmlFor="promo-select-all"><strong>Pilih Semua Outlet</strong></label>
                            </div>
                            <div className="outlet-items-scroll">
                                {outlets.length > 0 ? outlets.map(outlet => (
                                    <div key={outlet.ID} className="outlet-item">
                                        <input 
                                            type="checkbox" 
                                            id={`promo-outlet-${outlet.ID}`}
                                            checked={selectedOutlets.includes(outlet.ID)}
                                            onChange={() => handleOutletToggle(outlet.ID)}
                                        />
                                        <label htmlFor={`promo-outlet-${outlet.ID}`}>{outlet.Name}</label>
                                    </div>
                                )) : <p className="no-data-text">Memuat outlet...</p>}
                            </div>
                        </div>
                        <small className="helper-text">{selectedOutlets.length} outlet dipilih.</small>
                    </div>
                )}

                <div className="actions-row">
                    <button type="button" onClick={onClose} className="button-secondary">Batal</button>
                    <button type="submit" className="button-primary" disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Promosi'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default CreatePromotionModal;