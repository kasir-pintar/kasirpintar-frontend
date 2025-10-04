// LOKASI: src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { NumericFormat } from 'react-number-format';
import './PaymentModal.scss';

function PaymentModal({ isOpen, onRequestClose, totalAmount, onConfirm }) {
  const [cashTendered, setCashTendered] = useState('');
  const [change, setChange] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');

  useEffect(() => {
    if (isOpen) {
      setCashTendered('');
      setChange(0);
      setPaymentMethod('Tunai');
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
    if (paymentMethod === 'Tunai' && parseFloat(cashTendered) < totalAmount) {
      alert('Uang tunai yang diterima kurang dari total belanja.');
      return;
    }
    onConfirm(paymentMethod);
  };

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setPaymentMethod(newMethod);
    if (newMethod !== 'Tunai') {
      setCashTendered(totalAmount.toString());
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="payment-modal" overlayClassName="payment-modal-overlay">
      <h2>Proses Pembayaran</h2>
      <div className="summary-row">
        <span>Total Belanja:</span>
        <span className="total-amount">Rp {totalAmount.toLocaleString('id-ID')}</span>
      </div>
      <div className="payment-method-row">
        <label><input type="radio" value="Tunai" checked={paymentMethod === 'Tunai'} onChange={handleMethodChange} /> Tunai</label>
        <label><input type="radio" value="QRIS" checked={paymentMethod === 'QRIS'} onChange={handleMethodChange} /> QRIS</label>
        <label><input type="radio" value="Debit" checked={paymentMethod === 'Debit'} onChange={handleMethodChange} /> Debit</label>
      </div>
      
      {paymentMethod === 'Tunai' && (
        <>
          <div className="input-row">
            <label htmlFor="cash-tendered">Uang Diterima:</label>
            <NumericFormat id="cash-tendered" value={cashTendered} onValueChange={(values) => setCashTendered(values.value)} thousandSeparator="." decimalSeparator="," prefix="Rp " placeholder="Rp 0" autoFocus />
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