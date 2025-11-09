// LOKASI: TransactionHistoryPage.jsx (LENGKAP - Menggunakan Modal Baru)

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions } from '../../services/history';
import { getAllOutlets } from '../../services/outlet';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ReceiptModal from '../../components/ReceiptModal';
// --- 🛑 PERUBAHAN IMPORT 🛑 ---
import ExportConfirmationModal from '../../components/ExportConfirmationModal'; 
// --- 🛑 AKHIR PERUBAHAN 🛑 ---
import './TransactionHistory.scss';
import { toast } from 'react-toastify';

// Fungsi getTokenData (Tetap sama)
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
  
  // State Filter (Default Kosong)
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); 

  // State untuk Modal Konfirmasi
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    onConfirmAction: () => {}
  });

  // useEffect untuk Fetch Outlets (Tetap sama)
  useEffect(() => {
    if (!isOwner) return;
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

  // useEffect untuk Debounce Search (Tetap sama)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- loadTransactions (Tetap sama) ---
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
        limit: limit, 
        start_date: startDate,
        end_date: endDate,
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
  }, [isOwner, selectedOutlet, debouncedSearch, currentPage, startDate, endDate, limit]);
  
  // useEffect untuk memuat data
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // useEffect untuk Reset Halaman
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedOutlet, debouncedSearch, startDate, endDate, limit]);

  // Handler untuk lihat struk (Tetap sama)
  const handleViewReceipt = (trx) => {
    const subtotal = trx.Subtotal ?? (trx.TotalAmount + trx.Discount);
    const receiptData = { ...trx, Subtotal: subtotal };
    setSelectedTransaction(receiptData);
    setIsReceiptModalOpen(true);
  };

  // Handler untuk Pagination (Tetap sama)
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handler Hapus Tanggal (Tetap sama)
  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // --- Handler untuk Modal ---
  const handleCloseModal = () => {
    setModalState({ isOpen: false, message: '', onConfirmAction: () => {} });
  };

  const handleConfirmModal = () => {
    modalState.onConfirmAction(); // 1. Jalankan fungsi ekspor
    handleCloseModal(); // 2. Tutup modal
  };

  // --- Fungsi ini sekarang MEMBUKA MODAL ---
  const openExportModal = (exportType) => {
    // 1. Buat pesan konfirmasi
    let confirmMessage = "Apakah Anda yakin ingin mengekspor data";
    if (startDate && !endDate) {
      confirmMessage += ` dari ${startDate} hingga hari ini?`;
    } else if (startDate && endDate) {
      confirmMessage += ` dari ${startDate} hingga ${endDate}?`;
    } else if (!startDate && endDate) {
      confirmMessage += ` sampai ${endDate}?`;
    } else {
      confirmMessage += " (semua data terbaru)?";
    }

    // 2. Definisikan Aksi yang akan dijalankan jika "Ya"
    const exportAction = () => {
      if (isOwner && !selectedOutlet) {
        toast.warn("Silakan pilih outlet terlebih dahulu.");
        return;
      }
      const API_URL = 'http://localhost:8080';
      const exportUrl = `${API_URL}/api/reports/transactions/export`;
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error("Sesi Anda habis. Silakan login kembali.");
        return;
      }
      const params = new URLSearchParams();
      params.append('type', exportType);
      params.append('token', token); 
      if (isOwner && selectedOutlet) {
        params.append('outlet_id', selectedOutlet);
      }
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }
      window.open(`${exportUrl}?${params.toString()}`, '_blank');
    };

    // 3. Buka Modal
    setModalState({
      isOpen: true,
      // title: 'Konfirmasi Ekspor', // Kita gunakan title default dari modal
      message: confirmMessage,
      onConfirmAction: exportAction
    });
  };


  return (
    <div className="history-layout">
      <header className="history-header">
        <h1>Riwayat Transaksi</h1>
        {user?.role === 'cashier' && (
          <Link to="/cashier" className="back-button">
            Kembali ke Kasir
          </Link>
        )}
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
          
          <div className="date-range-filter">
            <label htmlFor="start-date">Tgl. Mulai:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isOwner && !selectedOutlet}
              className="date-input"
            /> 
          </div>

          <div className="date-range-filter">
            <label htmlFor="end-date">Tgl. Selesai:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isOwner && !selectedOutlet}
              className="date-input"
            /> 
          </div>
          
          {(startDate || endDate) && (
            <button 
              onClick={handleClearDates}
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
          
          <div className="export-buttons">
              <button 
                  className="export-btn excel"
                  onClick={() => openExportModal('excel')}
                  disabled={loading || (isOwner && !selectedOutlet)}
              >
                  Ekspor Excel
              </button>
          </div>
        </div>

        <div className="date-filter-info">
          {startDate && !endDate && (
            <span>
              Menampilkan data dari <strong>{startDate}</strong> hingga <strong>hari ini</strong> (diurutkan dari yang paling lama).
            </span>
          )}
          {startDate && endDate && (
            <span>
              Menampilkan data dari <strong>{startDate}</strong> hingga <strong>{endDate}</strong> (diurutkan dari yang paling lama).
            </span>
          )}
          {!startDate && endDate && (
            <span>
              Menampilkan data dari awal hingga <strong>{endDate}</strong> (diurutkan dari yang paling lama).
            </span>
          )}
        </div>


        {/* ... (Sisa JSX: loading, error, list, pagination, modal - TIDAK BERUBAH) ... */}
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
                  {debouncedSearch || startDate || endDate ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada riwayat transaksi."}
                </p>
              )}
            </div>

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
          </>
        )}
      </main>

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transactionData={selectedTransaction}
      />

      {/* --- 🛑 PERUBAHAN KOMPONEN 🛑 --- */}
      <ExportConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        // title={modalState.title} // Kita gunakan title default
        message={modalState.message}
      />
      {/* --- 🛑 AKHIR PERUBAHAN 🛑 --- */}

    </div>
  );
}

export default TransactionHistoryPage;