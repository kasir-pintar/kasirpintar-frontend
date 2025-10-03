// LOKASI: src/pages/TransactionHistory/TransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransactions } from '../../services/reports';
import './TransactionHistory.scss'; // <-- Import file SCSS

function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data || []);
      } catch (err) {
        setError('Gagal memuat data transaksi.');
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  return (
    <div className="page-container">
      <Link to="/dashboard" className="back-link">{'< Kembali ke Dashboard'}</Link>
      <h1 className="page-title">Riwayat Transaksi</h1>

      {loading && <p>Memuat data...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu Transaksi</th>
                <th>Invoice</th>
                <th>Kasir</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map(trx => (
                  <tr key={trx.ID}>
                    <td>{new Date(trx.CreatedAt).toLocaleString('id-ID')}</td>
                    <td>{trx.InvoiceNumber}</td>
                    <td>{trx.User?.Name || 'N/A'}</td>
                    <td>Rp {trx.TotalAmount.toLocaleString('id-ID')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Belum ada transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionHistoryPage;