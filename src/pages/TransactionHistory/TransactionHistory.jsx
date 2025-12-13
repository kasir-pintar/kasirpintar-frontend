import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions } from '../../services/history'; // Pastikan path ini benar
import { getAllOutlets } from '../../services/outlet';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ReceiptModal from '../../components/ReceiptModal';
import './TransactionHistory.scss';
import { toast } from 'react-toastify';

// --- Fungsi getTokenData (Tetap sama) ---
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

function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk UI Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // State untuk User & Outlets
  const [user] = useState(getTokenData());
  const isOwner = user?.role === 'owner';
  const [outlets, setOutlets] = useState([]);
  
  // --- 🔹 STATE FILTER & PAGINATION 🔹 ---
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // State untuk limit
  // --- 🔹 AKHIR STATE 🔹 ---

  // useEffect untuk Fetch Outlets (Tetap sama)
  useEffect(() => {
    if (!isOwner) return;
     const fetchOutlets = async () => {
      try {
        const res = await getAllOutlets();
        setOutlets(res || []);
      } catch (err) {
        console.error('Gagal memuat outlet:', err);
        toast.error('Gagal memuat daftar outlet.');
      }
    };
    fetchOutlets();
  }, [isOwner]);

  // useEffect untuk Debounce Search (Tetap sama)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- 🔹 loadTransactions (Sudah benar) 🔹 ---
  const loadTransactions = useCallback(async () => {
    if (isOwner && !selectedOutlet) {
      setTransactions([]);
      setLoading(false);
      setError('');
      setTotalPages(1);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = {
        outletId: isOwner ? selectedOutlet : undefined,
        search: debouncedSearch,
        page: currentPage,
        date: selectedDate,
        limit: limit, 
      };

      const responseData = await fetchTransactions(params);

      setTransactions(responseData.data.data || []);
      setTotalPages(responseData.data.pagination.total_pages || 1);
      
      if (responseData.data.pagination.current_page > responseData.data.pagination.total_pages && responseData.data.pagination.total_pages > 0) {
        setCurrentPage(responseData.data.pagination.total_pages);
      } else if (responseData.data.pagination.total_pages === 0) {
        setCurrentPage(1);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Terjadi kesalahan';
      console.error("Error di loadTransactions:", err); 
      setError(`Gagal memuat riwayat transaksi: ${errorMessage}`);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [isOwner, selectedOutlet, debouncedSearch, currentPage, selectedDate, limit]);
  
  // useEffect untuk memuat data
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // useEffect untuk Reset Halaman
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedOutlet, debouncedSearch, selectedDate, limit]);

  // Handler untuk lihat struk
  const handleViewReceipt = (trx) => {
    const subtotal = trx.Subtotal ?? (trx.TotalAmount + trx.Discount);

    const receiptData = {
      ...trx,
      Subtotal: subtotal,
      TaxPercent: trx.tax_percent ?? 0,
      TaxAmount: trx.tax_amount ?? 0,
    };

    setSelectedTransaction(receiptData);
    setIsReceiptModalOpen(true);
  };

  // Handler untuk Pagination
  const handlePageChange = (newPage) => {
     if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="history-layout">
      <header className="history-header">
        <h1>Riwayat Transaksi</h1>
        
        {/* --- 🛑 PERBAIKAN DI SINI 🛑 --- */}
        {/* Tombol ini sekarang hanya muncul jika role adalah 'cashier' */}
        {user?.role === 'cashier' && (
          <Link to="/cashier" className="back-button">
            Kembali ke Kasir
          </Link>
        )}
        {/* Role 'owner', 'admin', 'branch_manager' tidak akan melihat tombol ini */}
        
      </header>
      <main className="history-content">
        
        {isOwner && (
          <div className="filter-panel-trx card">
            <label htmlFor="outlet-select">Pilih Outlet</label>
            <p>Pilih outlet untuk melihat riwayat transaksinya.</p>
            <select
              id="outlet-select"
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
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

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Cari No. Invoice atau Nama Pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isOwner && !selectedOutlet}
            className="search-input"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isOwner && !selectedOutlet}
            className="date-input"
          /> 
          {/* --- 🛑 KARAKTER '}' YANG ERROR SUDAH DIHAPUS DARI SINI 🛑 --- */}
          
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')} 
              className="clear-date-btn"
            >
              Hapus Tanggal
            </button>
          )}

          <div className="limit-selector">
            <label htmlFor="limit-select">Tampilkan:</label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={loading || (isOwner && !selectedOutlet)}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {loading && <p className="loading-text">Memuat data...</p>}
        {error && <p className="error-message">{error}</p>}
        {isOwner && !selectedOutlet && !loading && !error && (
          <p className="info-text">Silakan pilih outlet di atas untuk melihat riwayat transaksi.</p>
        )}

        {!loading && !error && (!isOwner || (isOwner && selectedOutlet)) && (
          <>
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
                <p className="info-text">
                  {debouncedSearch || selectedDate ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada riwayat transaksi."}
                </p>
              )}
            </div>

            {/* --- 🔹 KONTROL PAGINATION (HANYA TOMBOL) 🔹 --- */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <div className="page-nav">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    &laquo; Sebelumnya
                  </button>
                  <span>
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Selanjutnya &raquo;
                  </button>
                </div>
              </div>
            )}
            {/* --- 🔹 AKHIR KONTROL 🔹 --- */}
          </>
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