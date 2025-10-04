// LOKASI: src/components/DiscountModal.jsx (KODE LENGKAP & FINAL)
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { NumericFormat } from 'react-number-format';
import './DiscountModal.scss';

function DiscountModal({ isOpen, onClose, onApply, currentDiscount, subtotal }) {
  const [discountValue, setDiscountValue] = useState(''); // <-- Ubah nilai awal menjadi string kosong
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Jika ada diskon sebelumnya, tampilkan sebagai nilai, jika tidak, kosongkan
      setDiscountValue(currentDiscount > 0 ? currentDiscount.toString() : '');
      setError('');
    }
  }, [isOpen, currentDiscount]);

  const handleApplyClick = () => {
    // Jika input kosong, anggap diskonnya 0
    const value = discountValue === '' ? 0 : parseFloat(discountValue);

    if (isNaN(value) || value < 0) {
      setError('Diskon harus berupa angka positif.');
      return;
    }
    if (value > subtotal) {
      setError('Diskon tidak boleh melebihi subtotal.');
      return;
    }
    onApply(value);
    onClose();
  };
  
  const handleValueChange = (values) => {
    setDiscountValue(values.value);
    if (error) setError('');
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="discount-modal"
      overlayClassName="discount-modal-overlay"
    >
      <h2>Masukkan Diskon</h2>
      {error && <p className="modal-error-message">{error}</p>}
      
      <div className="input-row">
        <label htmlFor="discount-input">Jumlah Diskon (Rp):</label>
        <NumericFormat
          id="discount-input"
          value={discountValue}
          onValueChange={handleValueChange}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          className="discount-input-field"
          allowLeadingZeros={false}
          placeholder="Rp 0" // <-- PERBAIKAN UTAMA DI SINI
          autoFocus
        />
      </div>

      <div className="actions-row">
        <button onClick={onClose} className="button-secondary">Batal</button>
        <button onClick={handleApplyClick} className="button-primary">Terapkan</button>
      </div>
    </Modal>
  );
}

export default DiscountModal;