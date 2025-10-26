import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions } from '../../services/history';
import { getAllOutlets } from '../../services/outlet'; // <-- TAMBAHKAN
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ReceiptModal from '../../components/ReceiptModal';
import './TransactionHistory.scss';
import { toast } from 'react-toastify';

// --- 🔹 FUNGSI PENTING UNTUK DECODE TOKEN 🔹 ---
const getTokenData = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    console.error("Token tidak valid atau rusak:", e);
    return null;
  }
};
// --- 🔹 AKHIR FUNGSI 🔹 ---

function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // --- 🔹 PERBAIKAN: State untuk User & Outlets 🔹 ---
  const [user, setUser] = useState(getTokenData());
  const isOwner = user?.role === 'owner';
  const [outlets, setOutlets] = useState([]);
  // 'selectedOutlet' dimulai kosong untuk Owner
  const [selectedOutlet, setSelectedOutlet] = useState(''); 
  // --- 🔹 AKHIR PERBAIKAN 🔹 ---

  // --- 🔹 PERBAIKAN: useEffect untuk Fetch Outlets (Owner) 🔹 ---
  useEffect(() => {
    if (!isOwner) return; // Hanya jalankan jika owner
    const fetchOutlets = async () => {
      try {
        const res = await getAllOutlets();
        setOutlets(res.data || []);
      } catch (err) {
        console.error('Gagal memuat outlet:', err);
        toast.error('Gagal memuat daftar outlet.');
      }
    };
    fetchOutlets();
  }, [isOwner]);
  // --- 🔹 AKHIR PERBAIKAN 🔹 ---

  // --- 🔹 PERBAIKAN: loadTransactions 🔹 ---
  const loadTransactions = useCallback(async () => {
    // 1. Jangan fetch jika Owner belum memilih outlet
    if (isOwner && !selectedOutlet) {
      setTransactions([]); // Pastikan daftar kosong
      setLoading(false);
      setError(''); // Tidak ada error, hanya menunggu pilihan
      return; 
    }

    try {
      setLoading(true);
      setError('');
      
      // 2. Tentukan outletId yang akan dikirim
      // Jika Owner, kirim 'selectedOutlet'.
      // Jika bukan Owner, kirim 'undefined' (backend akan pakai ID dari token)
      const outletToFetch = isOwner ? selectedOutlet : undefined;

      // 3. Kirim 'searchTerm' dan 'outletToFetch'
      const response = await fetchTransactions(searchTerm, outletToFetch);

      setTransactions(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Terjadi kesalahan';
      setError(`Gagal memuat riwayat transaksi: ${errorMessage}`);
      // Jangan tampilkan toast di sini agar tidak duplikat dengan pesan <p>
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  // 4. Tambahkan dependensi baru
  }, [searchTerm, isOwner, selectedOutlet]); 
  // --- 🔹 AKHIR PERBAIKAN 🔹 ---

  // --- useEffect untuk debounce (PANGGILANNYA DIPERBAIKI) ---
  useEffect(() => {
    // Debounce: tunggu 500ms setelah user berhenti mengetik
    const delayDebounceFn = setTimeout(() => {
      loadTransactions(); // Panggil tanpa parameter
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, loadTransactions]); // 'loadTransactions' sekarang jadi dependensi

  const handleViewReceipt = (trx) => {
    const subtotal = trx.Subtotal ?? (trx.TotalAmount + trx.Discount);
    const receiptData = { ...trx, Subtotal: subtotal };
    setSelectedTransaction(receiptData);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="history-layout">
      <header className="history-header">
        <h1>Riwayat Transaksi</h1>
        <Link to="/cashier" className="back-button">Kembali ke Kasir</Link>
      </header>
      <main className="history-content">
        
        {/* --- 🔹 TAMBAHKAN: Panel Filter Outlet untuk Owner 🔹 --- */}
        {isOwner && (
          <div className="filter-panel-trx card"> {/* Gunakan class unik */}
            <label htmlFor="outlet-select">Pilih Outlet</label>
            <p>Pilih outlet untuk melihat riwayat transaksinya.</p>
            <select
              id="outlet-select"
              value={selectedOutlet}
              onChange={(e) => {
                setSelectedOutlet(e.target.value);
                // Kita tidak perlu me-reset 'searchTerm'
              }}
            >
              <option value="">Pilih Outlet...</option>
              {outlets.map((outlet) => (
                <option key={outlet.ID} value={outlet.ID}>
                  {outlet.Name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* --- 🔹 AKHIR TAMBAHAN 🔹 --- */}
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari No. Invoice atau Nama Pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Nonaktifkan pencarian jika Owner belum pilih outlet
            disabled={isOwner && !selectedOutlet}
          />
        </div>

        {loading && <p className="loading-text">Memuat data...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {/* Tampilkan pesan jika Owner belum memilih */}
        {isOwner && !selectedOutlet && !loading && !error && (
          <p className="info-text">Silakan pilih outlet di atas untuk melihat riwayat transaksi.</p>
        )}

        {/* Tampilkan list hanya jika tidak loading, tidak error, DAN (bukan owner ATAU owner sudah pilih) */}
        {!loading && !error && (!isOwner || (isOwner && selectedOutlet)) && (
          <div className="transaction-list">
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
              <p className="info-text">{searchTerm ? "Tidak ada transaksi yang cocok." : "Belum ada riwayat transaksi."}</p>
            )}
          </div>
        )}
      </main>

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transactionData={selectedTransaction}
      />
    </div>
  );
}

export default TransactionHistoryPage;