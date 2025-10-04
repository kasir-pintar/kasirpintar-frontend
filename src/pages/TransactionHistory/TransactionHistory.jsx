// LOKASI: src/pages/TransactionHistory/TransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions } from '../../services/history';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ReceiptModal from '../../components/ReceiptModal';
import './TransactionHistory.scss';

function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadTransactions(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadTransactions = async (query) => {
    try {
      setLoading(true);
      const data = await fetchTransactions(query);
      setTransactions(data || []);
    } catch (err) {
      setError('Gagal memuat riwayat transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (trx) => {
    const subtotal = trx.TotalAmount + trx.Discount;
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
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari No. Invoice atau Nama Pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p className="loading-text">Memuat data...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && (
          <div className="transaction-list">
            {transactions.map(trx => (
              // --- DIV UTAMA SEKARANG TIDAK MEMILIKI ONCLICK ---
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
                      <span className="value">Rp {trx.TotalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="trx-detail">
                      <span className="label">Pelanggan</span>
                      <span className="value">{trx.Customer?.Name || 'Pelanggan Umum'}</span>
                    </div>
                    <div className="trx-detail">
                      <span className="label">Kasir</span>
                      <span className="value">{trx.User?.Name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                {/* --- TOMBOL CETAK BARU DENGAN ONCLICK --- */}
                <div className="trx-actions">
                  <button onClick={() => handleViewReceipt(trx)} className="reprint-button">
                    Cetak
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="loading-text">Tidak ada transaksi yang cocok.</p>}
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