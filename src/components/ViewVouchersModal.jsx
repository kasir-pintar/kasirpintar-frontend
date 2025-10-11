// LOKASI: src/components/ViewVouchersModal.jsx
import React from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import './ViewVouchersModal.scss';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';

Modal.setAppElement('#root');

const VoucherRow = ({ voucher }) => {
  // PERBAIKAN: Menggunakan voucher.Code (huruf besar C)
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode "${code}" berhasil disalin!`);
  };

  return (
    // PERBAIKAN: Menggunakan voucher.IsUsed (huruf besar I dan U)
    <div className={`voucher-row ${voucher.IsUsed ? 'used' : 'available'}`}>
      {/* PERBAIKAN: Menggunakan voucher.Code (huruf besar C) */}
      <span className="voucher-code">{voucher.Code}</span>
      <div className="voucher-status">
        {voucher.IsUsed ? (
          <>
            <FaCheck />
            <span>Terpakai</span>
          </>
        ) : (
          <span>Tersedia</span>
        )}
      </div>
      <button onClick={() => handleCopy(voucher.Code)} className="copy-btn">
        <FaCopy /> Salin
      </button>
    </div>
  );
};

function ViewVouchersModal({ isOpen, onClose, promotion }) {
  if (!promotion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="vouchers-modal"
      overlayClassName="vouchers-modal-overlay"
    >
      <div className="modal-header">
        {/* PERBAIKAN: Menggunakan promotion.Name (huruf besar N) */}
        <h2>Daftar Voucher: {promotion.Name}</h2>
        <button onClick={onClose} className="close-btn"><FaTimes /></button>
      </div>
      <div className="modal-body">
        {/* PERBAIKAN: Menggunakan promotion.Vouchers (huruf besar V) */}
        <p>Total {promotion.Vouchers?.length || 0} voucher dibuat untuk promosi ini.</p>
        <div className="vouchers-list">
          {promotion.Vouchers && promotion.Vouchers.length > 0 ? (
            promotion.Vouchers.map(voucher => (
              // PERBAIKAN: Menggunakan voucher.ID (huruf besar ID)
              <VoucherRow key={voucher.ID} voucher={voucher} />
            ))
          ) : (
            <p>Tidak ada voucher untuk promosi ini.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ViewVouchersModal;