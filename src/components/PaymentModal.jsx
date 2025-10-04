// LOKASI: src/components/PaymentModal.jsx (KODE LENGKAP & FINAL)
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { NumericFormat } from 'react-number-format';
import './PaymentModal.scss';

function PaymentModal({ isOpen, onRequestClose, totalAmount, onConfirm }) {
  const [cashTendered, setCashTendered] = useState('');
  const [change, setChange] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [error, setError] = useState(''); // <-- State baru untuk pesan error

  useEffect(() => {
    if (isOpen) {
      setCashTendered('');
      setChange(0);
      setPaymentMethod('Tunai');
      setError(''); // Reset error saat modal dibuka
    }
  }, [isOpen]);

  useEffect(() => {
    const cash = parseFloat(cashTendered);
    if (paymentMethod === 'Tunai' && !isNaN(cash) && cash >= totalAmount) {
      setChange(cash - totalAmount);
    } else {
      setChange(0);
    }
  }, [cashTendered, totalAmount, paymentMethod]);

  const handleConfirm = () => {
    const cash = parseFloat(cashTendered);
    if (paymentMethod === 'Tunai' && (isNaN(cash) || cash < totalAmount)) {
      // --- Ganti alert() dengan setState ---
      setError('Uang Diterima harus diisi dan tidak boleh kurang dari total.');
      return;
    }
    onConfirm(paymentMethod, cash, change);
  };

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setPaymentMethod(newMethod);
    setError(''); // Hapus error jika ganti metode
    if (newMethod !== 'Tunai') {
      setCashTendered(totalAmount.toString());
    }
  };
  
  const handleCashChange = (values) => {
    setCashTendered(values.value);
    setError(''); // Hapus error saat pengguna mulai mengetik
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="payment-modal" overlayClassName="payment-modal-overlay">
      <h2>Proses Pembayaran</h2>
      {/* --- Tampilkan pesan error di sini --- */}
      {error && <p className="modal-error-message">{error}</p>}
      
      <div className="summary-row"><span>Total Belanja:</span><span className="total-amount">Rp {totalAmount.toLocaleString('id-ID')}</span></div>
      <div className="payment-method-row">
        <label><input type="radio" value="Tunai" checked={paymentMethod === 'Tunai'} onChange={handleMethodChange} /> Tunai</label>
        <label><input type="radio" value="QRIS" checked={paymentMethod === 'QRIS'} onChange={handleMethodChange} /> QRIS</label>
        <label><input type="radio" value="Debit" checked={paymentMethod === 'Debit'} onChange={handleMethodChange} /> Debit</label>
      </div>
      {paymentMethod === 'Tunai' && (
        <>
          <div className="input-row">
            <label htmlFor="cash-tendered">Uang Diterima:</label>
            <NumericFormat id="cash-tendered" value={cashTendered} onValueChange={handleCashChange} thousandSeparator="." decimalSeparator="," prefix="Rp " placeholder="Rp 0" autoFocus />
          </div>
          <div className="summary-row">
            <span>Kembalian:</span>
            <span className="change-amount">Rp {change.toLocaleString('id-ID')}</span>
          </div>
        </>
      )}
      <div className="actions-row">
        <button onClick={onRequestClose} className="button-secondary">Batal</button>
        <button onClick={handleConfirm} className="button-primary">Konfirmasi Pembayaran</button>
      </div>
    </Modal>
  );
}
export default PaymentModal;