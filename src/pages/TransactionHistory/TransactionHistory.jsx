import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Link } from 'react-router-dom';
// --- Pastikan path service benar ---
import { fetchTransactions } from '../../services/history';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
// --- Pastikan path komponen modal benar ---
import ReceiptModal from '../../components/ReceiptModal';
import './TransactionHistory.scss';
import { toast } from 'react-toastify'; // Import toast for better error feedback

function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState([]); // Inisialisasi sudah benar []
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // --- FUNGSI LOAD TRANSACTIONS DIPERBAIKI ---
    // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render,
    // kecuali dependensinya (misal: service fetchTransactions) berubah.
    const loadTransactions = useCallback(async (query) => {
        try {
            setLoading(true);
            setError(''); // Reset error
            // Panggil service, response = { data: [...] }
            const response = await fetchTransactions(query);

            // --- PERBAIKAN DI SINI ---
            // Akses array di dalam properti 'data'
            setTransactions(response.data || []);
            // --- AKHIR PERBAIKAN ---

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Terjadi kesalahan';
            setError(`Gagal memuat riwayat transaksi: ${errorMessage}`);
            toast.error(`Gagal memuat riwayat transaksi: ${errorMessage}`);
            setTransactions([]); // Pastikan tetap array jika error
        } finally {
            setLoading(false);
        }
    }, []); // Dependensi kosong jika fetchTransactions tidak berubah

    // --- useEffect untuk debounce dan memanggil loadTransactions ---
    useEffect(() => {
        // Debounce: tunggu 500ms setelah user berhenti mengetik
        const delayDebounceFn = setTimeout(() => {
            loadTransactions(searchTerm);
        }, 500);

        // Cleanup function untuk membatalkan timeout jika searchTerm berubah lagi
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, loadTransactions]); // Tambahkan loadTransactions sebagai dependensi

    const handleViewReceipt = (trx) => {
        // Hitung subtotal jika tidak ada di data trx (opsional, tergantung backend)
        const subtotal = trx.Subtotal ?? (trx.TotalAmount + trx.Discount);
        const receiptData = { ...trx, Subtotal: subtotal };
        setSelectedTransaction(receiptData);
        setIsReceiptModalOpen(true);
    };

    return (
        <div className="history-layout">
            <header className="history-header">
                <h1>Riwayat Transaksi</h1>
                {/* Gunakan button jika hanya navigasi sederhana */}
                <Link to="/cashier" className="back-button">Kembali ke Kasir</Link>
            </header>
            <main className="history-content">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Cari No. Invoice atau Nama Pelanggan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} // Hanya update state, useEffect akan trigger load
                    />
                </div>

                {loading && <p className="loading-text">Memuat data...</p>}
                {error && <p className="error-message">{error}</p>}

                {/* Tampilkan list hanya jika tidak loading dan tidak ada error */}
                {!loading && !error && (
                    <div className="transaction-list">
                        {/* Periksa lagi jika transactions adalah array */}
                        {Array.isArray(transactions) && transactions.length > 0 ? (
                            transactions.map(trx => (
                                <div key={trx.ID} className="transaction-item">
                                    <div className="trx-content">
                                        <div className="trx-header">
                                            <span className="invoice">{trx.InvoiceNumber}</span>
                                            <span className="date">
                                                {format(new Date(trx.CreatedAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                                            </span>
                                        </div>
                                        <div className="trx-body">
                                            <div className="trx-detail">
                                                <span className="label">Total</span>
                                                <span className="value">Rp {trx.TotalAmount?.toLocaleString('id-ID') ?? 0}</span>
                                            </div>
                                            <div className="trx-detail">
                                                <span className="label">Pelanggan</span>
                                                <span className="value">{trx.Customer?.Name || 'Pelanggan Umum'}</span>
                                            </div>
                                            <div className="trx-detail">
                                                <span className="label">Kasir</span>
                                                <span className="value">{trx.User?.Name || 'N/A'}</span>
                                            </div>
                                             {/* Tampilkan Diskon jika ada */}
                                            {trx.Discount > 0 && (
                                                <div className="trx-detail discount">
                                                    <span className="label">Diskon</span>
                                                    <span className="value">- Rp {trx.Discount?.toLocaleString('id-ID') ?? 0}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="trx-actions">
                                        <button onClick={() => handleViewReceipt(trx)} className="reprint-button">
                                            Lihat Struk
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                             // Tampilkan pesan jika array kosong
                            <p className="info-text">{searchTerm ? "Tidak ada transaksi yang cocok dengan pencarian Anda." : "Belum ada riwayat transaksi."}</p>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Struk */}
            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                transactionData={selectedTransaction}
            />
        </div>
    );
}

export default TransactionHistoryPage;