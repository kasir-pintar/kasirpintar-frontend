// LOKASI: src/components/ReceiptModal.jsx (FINAL DENGAN NAMA PELANGGAN)
import React from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import './ReceiptModal.scss';

function ReceiptModal({ isOpen, onClose, transactionData }) {
  if (!transactionData) {
    return null;
  }
  const handlePrint = () => {
    window.print();
  };

  const subtotal = transactionData.Subtotal || (transactionData.TotalAmount + transactionData.Discount);
  const discount = transactionData.Discount || 0;

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="receipt-modal" overlayClassName="receipt-modal-overlay">
      <div id="receipt-content" className="receipt-content">
        <header className="receipt-header">
          <h2>Struk Pembayaran</h2>
          <p>KasirPintar</p>
          <hr />
          <div className="receipt-details">
            <p><span>No. Invoice:</span> {transactionData.InvoiceNumber}</p>
            <p><span>Waktu:</span> {format(new Date(transactionData.CreatedAt), 'dd MMM yyyy, HH:mm', { locale: id })}</p>
            <p><span>Kasir:</span> {transactionData.User?.Name || 'N/A'}</p>
            {/* --- BARIS BARU UNTUK NAMA PELANGGAN --- */}
            <p><span>Pelanggan:</span> {transactionData.Customer?.Name || 'Pelanggan Umum'}</p>
          </div>
        </header>
        <main className="receipt-body">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Jml</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.Details?.map(detail => (
                <tr key={detail.ID}>
                  <td>{detail.Menu?.Name || 'N/A'}</td>
                  <td>{detail.Quantity}</td>
                  <td>{(detail.Price || 0).toLocaleString('id-ID')}</td>
                  <td>{(detail.Price * detail.Quantity).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
        <footer className="receipt-footer">
          <hr />
          <div className="receipt-summary">
            <p><span>Subtotal:</span> Rp {subtotal.toLocaleString('id-ID')}</p>
            {discount > 0 && (
              <p><span>Diskon:</span> - Rp {discount.toLocaleString('id-ID')}</p>
            )}
            <h3><span>Total:</span> Rp {(transactionData.TotalAmount || 0).toLocaleString('id-ID')}</h3>
            <p><span>Metode Bayar:</span> {transactionData.PaymentMethod}</p>
            {transactionData.PaymentMethod === 'Tunai' && (
              <>
                <p><span>Uang Tunai:</span> Rp {(transactionData.CashTendered || 0).toLocaleString('id-ID')}</p>
                <p><span>Kembalian:</span> Rp {(transactionData.Change || 0).toLocaleString('id-ID')}</p>
              </>
            )}
          </div>
          <hr />
          <p className="thank-you">Terima kasih atas kunjungan Anda!</p>
        </footer>
      </div>
      <div className="receipt-actions">
        <button onClick={handlePrint} className="print-button">Cetak Struk</button>
        <button onClick={onClose} className="new-trx-button">Transaksi Baru</button>
      </div>
    </Modal>
  );
}

export default ReceiptModal;