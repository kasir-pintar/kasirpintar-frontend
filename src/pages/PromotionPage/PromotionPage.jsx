// LOKASI: src/pages/PromotionPage/PromotionPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllPromotions, updatePromotionStatus } from '../../services/promotion';
import CreatePromotionModal from '../../components/CreatePromotionModal';
import './PromotionPage.scss';
import { FaPlus, FaTicketAlt, FaPercent, FaMoneyBillWave, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Komponen Kartu Promosi dengan Tombol Aksi
const PromotionCard = ({ promo, onStatusChange }) => {
  // --- FUNGSI DENGAN NAMA YANG SUDAH DIPERBAIKI ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const getPromoValue = () => promo.type === 'PERCENTAGE' ? `${promo.value}%` : `Rp ${parseInt(promo.value).toLocaleString('id-ID')}`;

  return (
    <div className={`promo-card status-${promo.status.toLowerCase()}`}>
      <div className="promo-card-header">
        <span className="promo-icon">{promo.type === 'PERCENTAGE' ? <FaPercent /> : <FaMoneyBillWave />}</span>
        <span className={`promo-status`}>{promo.status}</span>
      </div>
      <h4 className="promo-name">{promo.name}</h4>
      <p className="promo-value">{getPromoValue()}</p>
      <p className="promo-description">{promo.description}</p>
      <div className="promo-date-footer">
        <span>Berlaku:</span>
        <p>{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</p>
      </div>
      <div className="promo-actions-footer">
        {promo.status === 'INACTIVE' ? (
          <button className="btn-activate" onClick={() => onStatusChange(promo.id, 'ACTIVE')}>
            <FaToggleOn /> Aktifkan
          </button>
        ) : (
          <button className="btn-deactivate" onClick={() => onStatusChange(promo.id, 'INACTIVE')}>
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => { fetchPromotions(); }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePromotionCreated = () => { 
    fetchPromotions(); 
    toast.success("Promosi baru berhasil dibuat!");
  };

  const handleStatusChange = async (promoId, newStatus) => {
    try {
      const updatedPromotion = await updatePromotionStatus(promoId, newStatus);
      setPromotions(currentPromos => 
        currentPromos.map(p => p.id === promoId ? updatedPromotion : p)
      );
      toast.success(`Status promosi "${updatedPromotion.name}" berhasil diubah menjadi ${newStatus}.`);
    } catch (err) {
      toast.error(`Gagal mengubah status: ${err}`);
    }
  };

  return (
    <div className="promotion-container">
      <div className="promotion-header">
        <h1>Manajemen Promosi</h1>
        <button onClick={handleOpenModal} className="add-promo-btn"><FaPlus /> Buat Promosi Baru</button>
      </div>
      <div className="promotion-list">
        {loading && <p>Memuat data promosi...</p>}
        
        {!loading && !error && promotions.length === 0 && (
          <div className="no-data">
            <FaTicketAlt /><p>Belum ada promosi yang dibuat.</p><span>Klik "Buat Promosi Baru" untuk memulai.</span>
          </div>
        )}
        {!loading && promotions.length > 0 && (
          <div className="promo-grid">
            {promotions.map(promo => (
              <PromotionCard key={promo.id} promo={promo} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
      <CreatePromotionModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal} 
        onPromotionCreated={handlePromotionCreated} 
      />
    </div>
  );
}

export default PromotionPage;