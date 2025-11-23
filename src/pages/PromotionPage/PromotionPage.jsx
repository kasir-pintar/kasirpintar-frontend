import React, { useState, useEffect } from 'react';
// --- Pastikan path service benar ---
import { getAllPromotions, updatePromotionStatus, getPromotionById } from '../../services/promotion';
// --- Pastikan path komponen modal benar ---
import CreatePromotionModal from '../../components/CreatePromotionModal';
import ViewVouchersModal from '../../components/ViewVouchersModal';
import './PromotionPage.scss';
import { FaPlus, FaTicketAlt, FaPercent, FaMoneyBillWave, FaToggleOn, FaToggleOff, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

// Komponen Kartu Promosi (Tidak ada perubahan di sini, sudah benar)
const PromotionCard = ({ promo, onStatusChange, onViewVouchers, canEdit }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Gunakan promo.Type dan promo.Value
    const getPromoValue = () => {
        // Handle jika Value null atau undefined
        const value = promo.Value ?? 0;
        return promo.Type === 'PERCENTAGE' ? `${value}%` : `Rp ${parseInt(value).toLocaleString('id-ID')}`;
    }

    return (
        // Gunakan promo.Status
        <div className={`promo-card status-${promo.Status?.toLowerCase() || 'inactive'}`}> {/* Fallback status */}
            <div className="promo-card-header">
                <span className="promo-icon">{promo.Type === 'PERCENTAGE' ? <FaPercent /> : <FaMoneyBillWave />}</span>
                <span className={`promo-status`}>{promo.Status || 'Inactive'}</span> {/* Fallback status */}
            </div>
            {/* Gunakan promo.Name, promo.Value, promo.Description */}
            <h4 className="promo-name">{promo.Name || 'Nama Promosi'}</h4> {/* Fallback nama */}
            <p className="promo-value">{getPromoValue()}</p>
            <p className="promo-description">{promo.Description || '-'}</p> {/* Fallback deskripsi */}
            <div className="promo-date-footer">
                <span>Berlaku:</span>
                {/* start_date dan end_date tetap huruf kecil (sesuai JSON dari Go tanpa tag) */}
                <p>{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</p>
            </div>
            <div className="promo-actions-footer">
                {/* Gunakan promo.ID */}
                <button className="btn-view" onClick={() => onViewVouchers(promo.ID)}>
                    <FaEye /> Lihat Voucher
                </button>
                {canEdit && (promo.Status === 'INACTIVE' ? (
                    <button className="btn-activate" onClick={() => onStatusChange(promo.ID, 'ACTIVE')}>
                        <FaToggleOn /> Aktifkan
                    </button>
                ) : (
                    <button className="btn-deactivate" onClick={() => onStatusChange(promo.ID, 'INACTIVE')}>
                        <FaToggleOff /> Nonaktifkan
                    </button>
                ))}
            </div>
        </div>
    );
};


// Komponen Halaman Utama
function PromotionPage() {
    const [promotions, setPromotions] = useState([]); // Inisialisasi sudah benar []
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    // Tentukan role user dari token
    const token = localStorage.getItem('authToken');
    let userRole = '';
    try {
        if (token) userRole = jwtDecode(token).role || '';
    } catch (err) {
        console.error('Gagal decode token:', err);
    }
    const canEdit = (userRole && (userRole === 'owner' || userRole === 'admin'));

    // --- FUNGSI FETCHPROMOTIONS DIPERBAIKI ---
    const fetchPromotions = async () => {
        try {
            setLoading(true);
            setError('');
            // Panggil service, response = { data: [...] }
            const response = await getAllPromotions();

            // Service mungkin mengembalikan array langsung atau objek { data: [...] }
            const promos = response?.data || response || [];
            setPromotions(Array.isArray(promos) ? promos : (promos.data || []));

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || "Terjadi kesalahan";
            setError(errorMessage);
            toast.error(`Gagal memuat data promosi: ${errorMessage}`);
            setPromotions([]); // Pastikan tetap array jika error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleOpenCreateModal = () => setCreateModalOpen(true);
    const handleCloseCreateModal = () => setCreateModalOpen(false);

    const handlePromotionCreated = () => {
        fetchPromotions(); // Muat ulang data
        toast.success("Promosi baru berhasil dibuat!");
    };

    const handleStatusChange = async (promoId, newStatus) => {
        try {
            // Service updatePromotionStatus sudah harusnya mengembalikan { data: {...updatedPromo...} }
            const response = await updatePromotionStatus(promoId, { status: newStatus }); // Kirim status dalam body
            const updatedPromotion = response?.data || response;

            setPromotions(currentPromos =>
                currentPromos.map(p => p.ID === promoId ? (updatedPromotion || p) : p)
            );
            toast.success(`Status promosi "${updatedPromotion.Name}" berhasil diubah menjadi ${newStatus}.`);
        } catch (err) {
             const errorMessage = err.response?.data?.error || err.message || "Terjadi kesalahan";
            toast.error(`Gagal mengubah status: ${errorMessage}`);
        }
    };

    const handleViewVouchers = async (promoId) => {
        try {
            // Service getPromotionById sudah harusnya mengembalikan { data: {...promoWithVouchers...} }
            const response = await getPromotionById(promoId);
            setSelectedPromotion(response?.data || response); // Akses data dari response
            setViewModalOpen(true);
        } catch (err) {
             const errorMessage = err.response?.data?.error || err.message || "Terjadi kesalahan";
            toast.error(`Gagal memuat data voucher: ${errorMessage}`);
        }
    };

    const handleCloseViewModal = () => {
        setViewModalOpen(false);
        setSelectedPromotion(null);
    };


    // --- RENDER JSX ---
    return (
        <div className="promotion-container">
            <div className="promotion-header">
                <h1>Manajemen Promosi</h1>
                {canEdit && (
                    <button onClick={handleOpenCreateModal} className="add-promo-btn"><FaPlus /> Buat Promosi Baru</button>
                )}
            </div>
            <div className="promotion-list">
                {loading && <p className='loading-text'>Memuat data promosi...</p>}
                {/* Tampilkan error jika ada */}
                {!loading && error && <p className="error-message">{error}</p>}
                {/* Kondisi data kosong */}
                {!loading && !error && (!Array.isArray(promotions) || promotions.length === 0) && (
                    <div className="no-data">
                        <FaTicketAlt />
                        <p>Belum ada promosi yang dibuat.</p>
                        <span>Klik "Buat Promosi Baru" untuk memulai.</span>
                    </div>
                )}
                {/* Tampilkan grid jika data ada */}
                {!loading && !error && Array.isArray(promotions) && promotions.length > 0 && (
                    <div className="promo-grid">
                        {/* Sekarang promotions.map() akan bekerja */}
                        {promotions.map(promo => (
                            <PromotionCard
                                key={promo.ID}
                                promo={promo}
                                onStatusChange={handleStatusChange}
                                onViewVouchers={handleViewVouchers}
                                canEdit={canEdit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Create */}
            {canEdit && (
                <CreatePromotionModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onPromotionCreated={handlePromotionCreated}
                />
            )}

            {/* Modal View Vouchers */}
            <ViewVouchersModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                promotion={selectedPromotion} // Kirim data promosi lengkap (sudah termasuk voucher)
            />
        </div>
    );
}

export default PromotionPage;