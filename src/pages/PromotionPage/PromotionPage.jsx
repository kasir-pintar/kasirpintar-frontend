import React, { useState, useEffect } from 'react';
// Pastikan path service ini sudah benar sesuai struktur project Anda
import { getAllPromotions, updatePromotionStatus, getPromotionById } from '../../services/promotion';
import CreatePromotionModal from '../../components/CreatePromotionModal';
import ViewVouchersModal from '../../components/ViewVouchersModal';
import './PromotionPage.scss';
// Pastikan react-icons sudah terinstall: npm install react-icons
import { FaPlus, FaTicketAlt, FaPercent, FaMoneyBillWave, FaToggleOn, FaToggleOff, FaEye, FaStore } from 'react-icons/fa';
import { toast } from 'react-toastify';
// Pastikan jwt-decode sudah terinstall: npm install jwt-decode
import { jwtDecode } from 'jwt-decode';

// Komponen Kartu Promosi
const PromotionCard = ({ promo, onStatusChange, onViewVouchers, canEdit, showOutlet }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const getPromoValue = () => {
        const value = promo.Value ?? 0;
        return promo.Type === 'PERCENTAGE' ? `${value}%` : `Rp ${parseInt(value).toLocaleString('id-ID')}`;
    }

    return (
        <div className={`promo-card status-${promo.Status?.toLowerCase() || 'inactive'}`}>
            <div className="promo-card-header">
                <div className="icon-wrapper">
                    <span className="promo-icon">{promo.Type === 'PERCENTAGE' ? <FaPercent /> : <FaMoneyBillWave />}</span>
                    {/* TAMPILKAN OUTLET BADGE JIKA DIMINTA (UNTUK OWNER) */}
                    {showOutlet && (
                        <span className="outlet-badge">
                            <FaStore style={{marginRight: '4px'}}/> {promo.Outlet?.Name || 'N/A'}
                        </span>
                    )}
                </div>
                <span className={`promo-status`}>{promo.Status || 'Inactive'}</span>
            </div>
            
            <h4 className="promo-name">{promo.Name || 'Nama Promosi'}</h4>
            <p className="promo-value">{getPromoValue()}</p>
            <p className="promo-description">{promo.Description || '-'}</p>
            
            <div className="promo-date-footer">
                <span>Berlaku:</span>
                <p>{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</p>
            </div>
            
            <div className="promo-actions-footer">
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

function PromotionPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    
    // Cek Role
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role || '');
            } catch (err) {
                console.error('Gagal decode token:', err);
            }
        }
    }, []);
    
    const canEdit = (userRole === 'owner' || userRole === 'admin');
    // Hanya tampilkan nama outlet jika yang melihat adalah Owner/Admin
    const showOutletInfo = canEdit; 

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getAllPromotions();
            const promos = response?.data || response || [];
            setPromotions(Array.isArray(promos) ? promos : (promos.data || []));
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || "Terjadi kesalahan";
            setError(errorMessage);
            toast.error(`Gagal memuat data promosi: ${errorMessage}`);
            setPromotions([]);
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
        fetchPromotions();
        toast.success("Promosi baru berhasil dibuat!");
    };

    const handleStatusChange = async (promoId, newStatus) => {
        try {
            const response = await updatePromotionStatus(promoId, { status: newStatus });
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
            const response = await getPromotionById(promoId);
            setSelectedPromotion(response?.data || response);
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
                {!loading && error && <p className="error-message">{error}</p>}
                
                {!loading && !error && (!Array.isArray(promotions) || promotions.length === 0) && (
                    <div className="no-data">
                        <FaTicketAlt />
                        <p>Belum ada promosi yang dibuat.</p>
                        <span>Klik "Buat Promosi Baru" untuk memulai.</span>
                    </div>
                )}
                
                {!loading && !error && Array.isArray(promotions) && promotions.length > 0 && (
                    <div className="promo-grid">
                        {promotions.map(promo => (
                            <PromotionCard
                                key={promo.ID}
                                promo={promo}
                                onStatusChange={handleStatusChange}
                                onViewVouchers={handleViewVouchers}
                                canEdit={canEdit}
                                showOutlet={showOutletInfo} // Kirim props baru
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Render Modal hanya jika user memiliki izin (Owner/Admin) */}
            {canEdit && (
                <CreatePromotionModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    onPromotionCreated={handlePromotionCreated}
                />
            )}

            <ViewVouchersModal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                promotion={selectedPromotion} 
            />
        </div>
    );
}

export default PromotionPage;