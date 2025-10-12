// LOKASI: src/components/ConfirmationModal.jsx
import React from 'react';
import Modal from 'react-modal';
import './ConfirmationModal.scss';
import { FaExclamationTriangle } from 'react-icons/fa';

Modal.setAppElement('#root');

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="confirmation-modal"
      overlayClassName="confirmation-modal-overlay"
    >
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <FaExclamationTriangle />
        </div>
        <h2>{title || 'Konfirmasi'}</h2>
        <p>{message || 'Apakah Anda yakin ingin melanjutkan?'}</p>
        <div className="confirmation-actions">
          <button onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;