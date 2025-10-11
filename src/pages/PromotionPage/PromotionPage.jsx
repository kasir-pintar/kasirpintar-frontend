// LOKASI: src/pages/PromotionPage/PromotionPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllPromotions, updatePromotionStatus, getPromotionById } from '../../services/promotion';
import CreatePromotionModal from '../../components/CreatePromotionModal';
import ViewVouchersModal from '../../components/ViewVouchersModal';
import './PromotionPage.scss';
import { FaPlus, FaTicketAlt, FaPercent, FaMoneyBillWave, FaToggleOn, FaToggleOff, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Komponen Kartu Promosi dengan semua tombol aksi
const PromotionCard = ({ promo, onStatusChange, onViewVouchers }) => {
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // PERBAIKAN: Menggunakan promo.Type dan promo.Value
  const getPromoValue = () => promo.Type === 'PERCENTAGE' ? `${promo.Value}%` : `Rp ${parseInt(promo.Value).toLocaleString('id-ID')}`;

  return (
    // PERBAIKAN: Menggunakan promo.Status
    <div className={`promo-card status-${promo.Status.toLowerCase()}`}>
      <div className="promo-card-header">
        <span className="promo-icon">{promo.Type === 'PERCENTAGE' ? <FaPercent /> : <FaMoneyBillWave />}</span>
        <span className={`promo-status`}>{promo.Status}</span>
      </div>
      {/* PERBAIKAN: Menggunakan promo.Name, promo.Value, promo.Description */}
      <h4 className="promo-name">{promo.Name}</h4>
      <p className="promo-value">{getPromoValue()}</p>
      <p className="promo-description">{promo.Description}</p>
      <div className="promo-date-footer">
        <span>Berlaku:</span>
        {/* PERBAIKAN: start_date dan end_date tetap huruf kecil sesuai model */}
        <p>{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</p>
      </div>
      <div className="promo-actions-footer">
        {/* PERBAIKAN: Menggunakan promo.ID */}
        <button className="btn-view" onClick={() => onViewVouchers(promo.ID)}>
            <FaEye /> Lihat Voucher
        </button>
        {promo.Status === 'INACTIVE' ? (
          <button className="btn-activate" onClick={() => onStatusChange(promo.ID, 'ACTIVE')}>
            <FaToggleOn /> Aktifkan
          </button>
        ) : (
          <button className="btn-deactivate" onClick={() => onStatusChange(promo.ID, 'INACTIVE')}>
            <FaToggleOff /> Nonaktifkan
          </button>
        )}
      </div>
    </div>
  );
};

// Komponen Halaman Utama
function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllPromotions();
      setPromotions(data || []);
    } catch (err) {
      setError(err.toString());
      toast.error("Gagal memuat data promosi.");
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
      const updatedPromotion = await updatePromotionStatus(promoId, newStatus);
      setPromotions(currentPromos => 
        // PERBAIKAN: Menggunakan p.ID
        currentPromos.map(p => p.ID === promoId ? updatedPromotion : p)
      );
      toast.success(`Status promosi "${updatedPromotion.Name}" berhasil diubah menjadi ${newStatus}.`);
    } catch (err) {
      toast.error(`Gagal mengubah status: ${err}`);
    }
  };

  const handleViewVouchers = async (promoId) => {
    try {
      const promoData = await getPromotionById(promoId);
      setSelectedPromotion(promoData);
      setViewModalOpen(true);
    } catch (err) {
      toast.error(`Gagal memuat data voucher: ${err}`);
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
        <button onClick={handleOpenCreateModal} className="add-promo-btn"><FaPlus /> Buat Promosi Baru</button>
      </div>
      <div className="promotion-list">
        {loading && <p>Memuat data promosi...</p>}
        {!loading && !error && promotions.length === 0 && (
          <div className="no-data">
            <FaTicketAlt />
            <p>Belum ada promosi yang dibuat.</p>
            <span>Klik "Buat Promosi Baru" untuk memulai.</span>
          </div>
        )}
        {!loading && promotions.length > 0 && (
          <div className="promo-grid">
            {promotions.map(promo => (
              <PromotionCard 
                // PERBAIKAN: Menggunakan promo.ID
                key={promo.ID} 
                promo={promo} 
                onStatusChange={handleStatusChange} 
                onViewVouchers={handleViewVouchers}
              />
            ))}
          </div>
        )}
      </div>
      
      <CreatePromotionModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal} 
        onPromotionCreated={handlePromotionCreated} 
      />

      <ViewVouchersModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        promotion={selectedPromotion}
      />
    </div>
  );
}

export default PromotionPage;