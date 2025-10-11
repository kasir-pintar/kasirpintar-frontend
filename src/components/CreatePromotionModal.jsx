// LOKASI: src/components/CreatePromotionModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { createPromotion } from '../services/promotion';
import './CreatePromotionModal.scss';

// Set app element untuk aksesibilitas, sama seperti di modal lain
Modal.setAppElement('#root');

function CreatePromotionModal({ isOpen, onClose, onPromotionCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    start_date: '',
    end_date: '',
    voucher_qty: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi sederhana
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('Tanggal berakhir harus setelah tanggal mulai.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        voucher_qty: parseInt(formData.voucher_qty, 10),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      
      const newPromotion = await createPromotion(payload);
      onPromotionCreated(newPromotion);
      onClose();
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="promotion-modal"
      overlayClassName="promotion-modal-overlay"
    >
      <h2>Buat Promosi Baru</h2>
      {error && <p className="modal-error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="promo-form">
        <div className="form-group">
          <label htmlFor="name">Nama Promosi</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required autoFocus/>
        </div>
        <div className="form-group">
          <label htmlFor="description">Deskripsi</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Jenis Promosi</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange}>
              <option value="PERCENTAGE">Diskon Persentase (%)</option>
              <option value="FIXED_AMOUNT">Potongan Tetap (Rp)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="value">Nilai</label>
            <input type="number" id="value" name="value" placeholder="Contoh: 20 atau 10000" value={formData.value} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Tanggal Mulai</label>
            <input type="datetime-local" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">Tanggal Berakhir</label>
            <input type="datetime-local" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="voucher_qty">Jumlah Voucher</label>
          <input type="number" id="voucher_qty" name="voucher_qty" placeholder="Jumlah voucher unik" value={formData.voucher_qty} onChange={handleChange} required />
        </div>
        
        <div className="actions-row">
          <button type="button" onClick={onClose} className="button-secondary">Batal</button>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Promosi'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreatePromotionModal;