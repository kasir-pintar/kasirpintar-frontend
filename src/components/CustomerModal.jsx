// LOKASI: src/components/CustomerModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { searchCustomers, createCustomer } from '../services/customer';
import './CustomerModal.scss';

function CustomerModal({ isOpen, onClose, onSelectCustomer }) {
  const [view, setView] = useState('search'); // 'search' atau 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk form pelanggan baru
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  // Debounce search
  useEffect(() => {
    if (view !== 'search' || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchCustomers(searchTerm);
        setSearchResults(results || []);
      } catch (err) {
        console.error("Gagal mencari pelanggan:", err);
      } finally {
        setLoading(false);
      }
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, view]);

  const handleSelect = (customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  const handleCreateNewCustomer = async (e) => {
    e.preventDefault();
    setError('');
    if (!newName) {
      setError('Nama pelanggan wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const newCustomer = await createCustomer({ name: newName, phone_number: newPhone, email: newEmail });
      handleSelect(newCustomer);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal membuat pelanggan.');
    } finally {
      setLoading(false);
    }
  };

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setView('search');
      setSearchTerm('');
      setSearchResults([]);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setError('');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="customer-modal" overlayClassName="customer-modal-overlay">
      {view === 'search' ? (
        <>
          <h2>Pilih Pelanggan</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama atau no. HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="search-results">
            {loading && <p>Mencari...</p>}
            {!loading && searchResults.length > 0 && searchResults.map(customer => (
              <div key={customer.ID} className="result-item" onClick={() => handleSelect(customer)}>
                <p className="customer-name">{customer.Name}</p>
                <p className="customer-phone">{customer.PhoneNumber}</p>
              </div>
            ))}
            {!loading && searchTerm.length >= 2 && searchResults.length === 0 && (
              <p className="no-results">Pelanggan tidak ditemukan.</p>
            )}
          </div>
          <div className="modal-footer">
            <button onClick={() => handleSelect(null)} className="button-secondary">Pilih Pelanggan Umum</button>
            <button onClick={() => setView('create')} className="button-primary">Tambah Pelanggan Baru</button>
          </div>
        </>
      ) : (
        <>
          <h2>Tambah Pelanggan Baru</h2>
          {error && <p className="modal-error-message">{error}</p>}
          <form onSubmit={handleCreateNewCustomer} className="create-form">
            <div className="form-group">
              <label htmlFor="name">Nama Pelanggan</label>
              <input id="name" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Nomor HP</label>
              <input id="phone" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setView('search')} className="button-secondary">Kembali ke Pencarian</button>
              <button type="submit" className="button-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan & Pilih'}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}

export default CustomerModal;