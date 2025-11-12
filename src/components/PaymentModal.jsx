// LOKASI: src/components/PaymentModal.jsx (Perbaikan Nama Komponen QR)

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
// --- 🛑 PERBAIKAN 1 DI SINI 🛑 ---
import { QRCodeSVG } from 'qrcode.react'; // Nama komponen yang benar adalah QRCodeSVG
// --- 🛑 AKHIR PERBAIKAN 🛑 ---
import { createQRPayment } from '../services/payment';
import { NumericFormat } from 'react-number-format'; 
import './PaymentModal.scss'; 

// Pastikan elemen root Anda benar
Modal.setAppElement('#root');

function PaymentModal({ isOpen, onRequestClose, totalAmount, onConfirm }) {
  // State untuk metode pembayaran
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  
  // State untuk Pembayaran Tunai
  const [cashTendered, setCashTendered] = useState('');
  const [change, setChange] = useState(0);
  const [tunaiError, setTunaiError] = useState('');

  // State untuk Pembayaran QRIS
  const [qrString, setQrString] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [paymentError, setPaymentError] = useState(''); // Error untuk QR/Debit

  // Hitung kembalian (hanya untuk Tunai)
  useEffect(() => {
    const cash = parseFloat(cashTendered);
    if (paymentMethod === 'Tunai' && !isNaN(cash) && cash >= totalAmount) {
      setChange(cash - totalAmount);
    } else {
      setChange(0);
    }
  }, [cashTendered, totalAmount, paymentMethod]);


  // Fungsi untuk reset state modal saat ditutup
  const resetModalState = () => {
    setPaymentMethod('Tunai');
    setCashTendered('');
    setChange(0);
    setTunaiError('');
    setQrString('');
    setOrderId('');
    setIsLoadingQR(false);
    setPaymentError('');
  };

  // Fungsi untuk mengambil QR code dari backend
  const fetchQRCode = async () => {
    if (totalAmount <= 0) {
      setPaymentError('Total belanja tidak boleh nol.');
      return;
    }
    
    setIsLoadingQR(true);
    setPaymentError('');
    setQrString('');

    try {
      const response = await createQRPayment({ total_amount: totalAmount });
      // Simpan QR string dan Order ID dari backend
      setQrString(response.data.qr_string);
      setOrderId(response.data.order_id);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Gagal membuat QR Code. Coba lagi.';
      setPaymentError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoadingQR(false);
    }
  };

  // useEffect ini akan berjalan saat user mengganti metode pembayaran
  useEffect(() => {
    // Reset error & input saat ganti tab
    setTunaiError('');
    setPaymentError('');

    // Jika modal dibuka dan metodenya QRIS, langsung minta QR code
    if (isOpen && paymentMethod === 'QRIS') {
      fetchQRCode();
    }
    // Jika ganti metode, reset state QR
    if (paymentMethod !== 'QRIS') {
      setQrString('');
      setOrderId('');
    }
    // Reset input tunai jika ganti tab
    if (paymentMethod !== 'Tunai') {
      setCashTendered('');
    }
  }, [paymentMethod, isOpen, totalAmount]); // <-- Tambahkan dependensi


  // Handler untuk tombol "Konfirmasi Pembayaran" (HANYA UNTUK TUNAI)
  const handleConfirmTunai = () => {
    const cash = parseFloat(cashTendered);
    if (isNaN(cash) || cash < totalAmount) {
      setTunaiError('Uang Diterima harus diisi dan tidak boleh kurang dari total.');
      return;
    }
    // Panggil fungsi onConfirm dari CashierPage
    onConfirm('Tunai', cash, change);
    handleClose(); // Reset dan tutup
  };
  
  // Handler untuk tombol "Konfirmasi Pembayaran" (HANYA UNTUK DEBIT)
  const handleConfirmDebit = () => {
    // Langsung konfirmasi dengan uang pas
    onConfirm('Debit', totalAmount, 0);
    handleClose(); // Reset dan tutup
  };


  // Handler saat modal ditutup (misal klik overlay)
  const handleClose = () => {
    resetModalState();
    onRequestClose(); // Panggil fungsi penutup dari parent
  };

  // TODO: Tambahkan fungsi polling untuk cek status 'orderId'
  // useEffect(() => { ... });


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="payment-modal"
      overlayClassName="payment-modal-overlay"
    >
      <div className="payment-modal-header">
        <h2>Konfirmasi Pembayaran</h2>
        <button onClick={handleClose} className="close-button">×</button>
      </div>

      <div className="payment-modal-body">
        <div className="payment-total">
          <span>TOTAL BAYAR:</span>
          <strong>Rp {totalAmount.toLocaleString('id-ID')}</strong>
        </div>

        {/* --- Pilihan Metode Pembayaran --- */}
        <div className="payment-method-selector">
          <button
            className={`method-btn ${paymentMethod === 'Tunai' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('Tunai')}
          >
            Tunai
          </button>
          <button
            className={`method-btn ${paymentMethod === 'QRIS' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('QRIS')}
          >
            QRIS
          </button>
          <button
            className={`method-btn ${paymentMethod === 'Debit' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('Debit')}
          >
            Debit
          </button>
        </div>

        {/* --- KONTEN DINAMIS BERDASARKAN METODE --- */}

        {/* 1. Tampilan Tunai */}
        {paymentMethod === 'Tunai' && (
          <div className="payment-content tunai">
            {tunaiError && <p className="modal-error-message">{tunaiError}</p>}
            <div className="form-group">
              <label htmlFor="cash-tendered">Uang Diterima (Rp)</label>
              <NumericFormat
                id="cash-tendered"
                value={cashTendered}
                onValueChange={(values) => setCashTendered(values.value)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="Rp "
                placeholder="Rp 0"
                autoFocus
                className="cash-input"
              />
            </div>
            <div className="payment-info kembalian">
              <span>Kembalian:</span>
              <strong className={change > 0 ? 'has-change' : ''}>
                Rp {change.toLocaleString('id-ID')}
              </strong>
            </div>
            <button 
              className="confirm-button" 
              onClick={handleConfirmTunai}
              disabled={parseFloat(cashTendered) < totalAmount}
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        )}

        {/* 2. Tampilan QRIS */}
        {paymentMethod === 'QRIS' && (
          <div className="payment-content qris">
            {isLoadingQR && <p className="loading-text">Membuat QR Code...</p>}
            {paymentError && <p className="modal-error-message">{paymentError}</p>}
            
            {qrString && !isLoadingQR && (
              <div className="qr-container">
                <p>Silakan pindai QR Code di bawah ini</p>
                {/* --- 🛑 PERBAIKAN 2 DI SINI 🛑 --- */}
                <QRCodeSVG value={qrString} size={256} /> 
                {/* --- 🛑 AKHIR PERBAIKAN 🛑 --- */}
                <small>Order ID: {orderId}</small>
                <p className="waiting-text">Menunggu pembayaran...</p>
                <small>
                  (Tutup modal ini jika pelanggan sudah membayar. 
                  Transaksi akan tersimpan otomatis setelah pembayaran terkonfirmasi.)
                </small>
              </div>
            )}
          </div>
        )}

        {/* 3. Tampilan Debit */}
        {paymentMethod === 'Debit' && (
          <div className="payment-content debit">
            <p className="instruction-text">Silakan proses pembayaran di mesin EDC.</p>
            <button 
              className="confirm-button" 
              onClick={handleConfirmDebit}
            >
              Pembayaran Selesai (EDC)
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
}

export default PaymentModal;