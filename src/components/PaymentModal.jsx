// LOKASI: src/components/PaymentModal.jsx (GANTI TOTAL - PERBAIKAN POLLING)

import React, { useState, useEffect, useMemo, useRef } from 'react'; // Import useRef
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react'; 
import { createTransaction, checkTransactionStatus } from '../services/cashier';
import './PaymentModal.scss'; 

// Helper formatRupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// --- Komponen Internal untuk Polling QRIS ---
const QrisPaymentWatcher = ({
    qrString,
    invoiceNumber,
    expiryTime,
    onPaymentSuccess,
    onClose
}) => {
    const [status, setStatus] = useState('pending');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(900); 
    
    // --- 🛑 PERBAIKAN 1: Gunakan useRef untuk Interval 🛑 ---
    // Ini memastikan interval bersih saat komponen di-unmount
    const pollIntervalRef = useRef(null);

    // Set countdown timer
    useEffect(() => {
        if (expiryTime) {
            const expiry = new Date(expiryTime);
            const now = new Date();
            const secondsRemaining = Math.floor((expiry - now) / 1000);
            setTimeLeft(secondsRemaining > 0 ? secondsRemaining : 0);
        }
    }, [expiryTime]);

    // Countdown logic
    useEffect(() => {
        if (timeLeft <= 0) {
            setError("Waktu pembayaran habis. Silakan tutup dan ulangi transaksi.");
            if (pollIntervalRef.current) {
                 clearInterval(pollIntervalRef.current); // Stop polling
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Polling logic
    useEffect(() => {
        if (!invoiceNumber) {
            setError("Invoice number tidak valid, polling dihentikan.");
            return; // Jangan mulai polling jika invoiceNumber tidak ada
        }
        
        const poll = async () => {
             // --- 🛑 PERBAIKAN 2: Polling lebih 'bandel' 🛑 ---
             // Kita tidak akan menghentikan polling jika ada error jaringan
             try {
                const res = await checkTransactionStatus(invoiceNumber);
                if (res.status === 'PAID') {
                    setStatus('paid');
                    clearInterval(pollIntervalRef.current); // ✅ SUDAH BENAR
                    setTimeout(onPaymentSuccess, 1000);
                }
                // Jika masih PENDING, biarkan polling berlanjut
             } catch (err) {
                // Jangan hentikan polling, biarkan berlanjut
                console.error("Polling error (akan dicoba lagi):", err); 
             }
        };

        // Jalankan polling pertama kali, lalu set interval
        poll(); 
        pollIntervalRef.current = setInterval(poll, 3000); // Cek setiap 3 detik

        // Fungsi cleanup
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [invoiceNumber, onPaymentSuccess]); // Hanya bergantung pada 2 ini

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="qris-watcher">
            {status === 'pending' && (
                <>
                    <h4>Menunggu Pembayaran...</h4>
                    <p>Scan QR code di bawah ini.</p>
                    <div className="qr-container">
                        <QRCodeCanvas value={qrString} size={256} />
                    </div>
                    <h3>Batas Waktu: {formatTime(timeLeft)}</h3>
                    {error && <p className="error-text">{error}</p>}
                    <button onClick={onClose} className="btn-secondary">Batalkan Transaksi</button>
                </>
            )}
            {status === 'paid' && (
                <div className="payment-success">
                    <h2 style={{ color: 'green' }}>Pembayaran Berhasil!</h2>
                    <p>Mempersiapkan struk...</p>
                </div>
            )}
        </div>
    );
};


// --- KOMPONEN UTAMA PaymentModal ---
const PaymentModal = ({
    isOpen,
    onClose,
    onPaymentComplete, 
    cart,
    subtotal,
    discount,
    total,
    tax,
    customer,
    voucher
}) => {
    const [selectedMethod, setSelectedMethod] = useState('Tunai'); 
    const [cashTendered, setCashTendered] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [qrisData, setQrisData] = useState(null); 
    const [paymentError, setPaymentError] = useState('');
    // ================= DEBUG PAJAK =================
    useEffect(() => {
        console.log('[PAYMENT MODAL] tax:', tax);
    }, [tax]);
    // ===============================================

    const finalTotal = total + (tax?.amount || 0);

    const change = useMemo(() => {
        const changeVal = cashTendered - finalTotal;
        return changeVal >= 0 ? changeVal : 0;
    }, [cashTendered, finalTotal]);

    useEffect(() => {
        if (isOpen) {
            setSelectedMethod('Tunai');
            setCashTendered(0);
            setIsLoading(false);
            setQrisData(null);
            setPaymentError('');
        }
    }, [isOpen]);

    const handleCashChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setCashTendered(Number(value) || 0);
    };

    const handleCashFocus = (e) => { if (e.target.value === '0') e.target.value = ''; };
    const handleCashBlur = (e) => { if (e.target.value === '') e.target.value = '0'; };

    const handleSubmitPayment = async () => {
        setIsLoading(true);
        setPaymentError('');

        const payload = {
            items: cart.map(item => ({ menu_id: item.menu_id, quantity: item.quantity })),
            discount: discount,
            customer_id: customer ? customer.ID : null,
            voucher_id: voucher ? voucher.voucher_id : null, 
            payment_method: selectedMethod,
            cash_tandered: 0,
            change: 0
        };

        try {
            if (selectedMethod === 'Tunai') {
                if (cashTendered < finalTotal) {
                    toast.error("Uang tunai kurang dari total belanja!");
                    setIsLoading(false);
                    return;
                }
                payload.cash_tandered = cashTendered;
                payload.change = change;

                const response = await createTransaction(payload);
                toast.success("Transaksi Tunai Berhasil!");
                onPaymentComplete(response.data); 

            } else if (selectedMethod === 'QRIS') {
                const response = await createTransaction(payload);
                
                // --- 🛑 PERBAIKAN 3: Pastikan data ada 🛑 ---
                if (response.qr_string && response.data && response.data.InvoiceNumber) {
                    setQrisData({
                        qrString: response.qr_string,
                        invoiceNumber: response.data.InvoiceNumber,
                        expiry: response.midtrans_response?.expiry_time,
                        fullTransaction: response.data // 🔥 SIMPAN DATA LENGKAP
                    });
                } else {
                    throw new Error("Gagal mendapatkan data QR Code dari server.");
                }
            }
        } catch (err) {
            console.error("Payment error:", err);
            const errorMsg = err.error || "Terjadi kesalahan saat memproses pembayaran.";
            setPaymentError(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
        }
    };

    const handleQrisSuccess = () => {
        // 🔥 QRIS: gunakan data dari backend saat createTransaction
        onPaymentComplete(qrisData.fullTransaction);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose} 
            contentLabel="Modal Pembayaran"
            className="modal-content payment-modal"
            overlayClassName="modal-overlay"
            ariaHideApp={false} 
        >
            <div className="modal-header">
                <h3>Proses Pembayaran</h3>
                <button onClick={onClose} className="close-button">&times;</button>
            </div>
            
            <div className="modal-body">
                {!qrisData && (
                    <>
                    <div className="payment-summary">
                        <p>Subtotal: <span>{formatRupiah(subtotal)}</span></p>
                        <p>Diskon: <span>- {formatRupiah(discount)}</span></p>

                        {tax?.amount > 0 && (
                            <p>
                            Pajak ({tax.percent}%):
                            <span>{formatRupiah(tax.amount)}</span>
                            </p>
                        )}

                        <h4 className="total-amount">
                            Total Bayar:
                            <span>{formatRupiah(subtotal - discount + (tax?.amount || 0))}</span>
                        </h4>
                        </div>

                        <div className="payment-method-selector">
                            <button
                                className={`btn-method ${selectedMethod === 'Tunai' ? 'active' : ''}`}
                                onClick={() => setSelectedMethod('Tunai')}
                            >
                                Tunai
                            </button>
                            <button
                                className={`btn-method ${selectedMethod === 'QRIS' ? 'active' : ''}`}
                                onClick={() => setSelectedMethod('QRIS')}
                            >
                                QRIS
                            </button>
                        </div>

                        {selectedMethod === 'Tunai' && (
                            <div className="cash-payment">
                                <label htmlFor="cashTendered">Uang Diterima (Rp)</label>
                                <input
                                    type="text"
                                    id="cashTendered"
                                    value={new Intl.NumberFormat('id-ID').format(cashTendered)}
                                    onChange={handleCashChange}
                                    onFocus={handleCashFocus}
                                    onBlur={handleCashBlur}
                                    disabled={isLoading}
                                    className="cash-input"
                                />
                                <h4 className="total-amount">Kembalian: <span>{formatRupiah(change)}</span></h4>
                            </div>
                        )}

                        {selectedMethod === 'QRIS' && (
                            <div className="qris-payment-info">
                                <p>Pembayaran akan diproses menggunakan QRIS.</p>
                            </div>
                        )}

                        {paymentError && <p className="error-text">{paymentError}</p>}

                        <div className="modal-footer">
                            <button
                                onClick={handleSubmitPayment}
                                className="btn-primary"
                                disabled={isLoading || (selectedMethod === 'Tunai' && cashTendered < finalTotal)}
                            >
                                {isLoading ? "Memproses..." : (selectedMethod === 'Tunai' ? "Bayar Tunai" : "Buat Kode QRIS")}
                            </button>
                        </div>
                    </>
                )}

                {qrisData && (
                    <QrisPaymentWatcher
                        qrString={qrisData.qrString}
                        invoiceNumber={qrisData.invoiceNumber}
                        expiryTime={qrisData.expiry}
                        onPaymentSuccess={handleQrisSuccess}
                        onClose={onClose}
                    />
                )}
            </div>
        </Modal>
    );
};

export default PaymentModal;