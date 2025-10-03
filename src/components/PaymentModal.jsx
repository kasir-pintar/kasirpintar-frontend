// LOKASI: src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { NumericFormat } from 'react-number-format'; // <-- 1. IMPORT KOMPONEN BARU
import './PaymentModal.scss';

function PaymentModal({ isOpen, onRequestClose, totalAmount, onConfirm }) {
  // State sekarang menyimpan nilai angka murni, bukan string
  const [cashTendered, setCashTendered] = useState(''); 
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCashTendered('');
      setChange(0);
    }
  }, [isOpen]);

  useEffect(() => {
    // Langsung gunakan state angka
    const cash = parseFloat(cashTendered);
    if (!isNaN(cash) && cash >= totalAmount) {
      setChange(cash - totalAmount);
    } else {
      setChange(0);
    }
  }, [cashTendered, totalAmount]);

  const handleConfirm = () => {
    if (parseFloat(cashTendered) < totalAmount) {
      alert('Uang tunai yang diterima kurang dari total belanja.');
      return;
    }
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="payment-modal"
      overlayClassName="payment-modal-overlay"
    >
      <h2>Proses Pembayaran</h2>
      <div className="summary-row">
        <span>Total Belanja:</span>
        <span className="total-amount">Rp {totalAmount.toLocaleString('id-ID')}</span>
      </div>
      <div className="input-row">
        <label htmlFor="cash-tendered">Uang Diterima:</label>

        {/* --- 2. GANTI <input> BIASA DENGAN <NumericFormat> --- */}
        <NumericFormat
          id="cash-tendered"
          value={cashTendered}
          onValueChange={(values) => {
            // Simpan nilai murninya (tanpa format) ke dalam state
            setCashTendered(values.value);
          }}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          placeholder="Rp 0"
          autoFocus
        />

      </div>
      <div className="summary-row">
        <span>Kembalian:</span>
        <span className="change-amount">Rp {change.toLocaleString('id-ID')}</span>
      </div>
      <div className="actions-row">
        <button onClick={onRequestClose} className="button-secondary">Batal</button>
        <button onClick={handleConfirm} className="button-primary">Konfirmasi Pembayaran</button>
      </div>
    </Modal>
  );
}

export default PaymentModal;