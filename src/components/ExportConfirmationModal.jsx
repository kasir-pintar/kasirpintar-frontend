// LOKASI: src/components/ExportConfirmationModal.jsx (File Baru)
import React from 'react';
import Modal from 'react-modal';
import './ExportConfirmationModal.scss'; // <-- Nama file SCSS baru
import { FaExclamationTriangle } from 'react-icons/fa';

Modal.setAppElement('#root');

// Nama fungsi diubah
function ExportConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="export-confirmation-modal" // <-- Class CSS baru
      overlayClassName="export-confirmation-modal-overlay" // <-- Class CSS baru
    >
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <FaExclamationTriangle />
        </div>
        <h2>{title || 'Konfirmasi Ekspor'}</h2>
        <p>{message || 'Apakah Anda yakin ingin mengekspor data ini?'}</p>
        <div className="confirmation-actions">
          <button onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Ya, Ekspor
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ExportConfirmationModal; // <-- export diubah