// LOKASI: src/components/MenuFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './MenuFormModal.scss';

Modal.setAppElement('#root');

function MenuFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  
  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          name: initialData.Name || '',
          category: initialData.Category || '',
          price: initialData.Price || '',
          stock: initialData.Stock || ''
        });
      } else {
        setFormData({ name: '', category: '', price: '', stock: '' });
      }
    }
  }, [isOpen, initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };
      await onSubmit(payload);
    } catch (error) {
      // Error akan ditangani oleh toast di halaman utama
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="menu-form-modal"
      overlayClassName="menu-form-modal-overlay"
    >
      <h2>{isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-group">
          <label htmlFor="name">Nama Menu</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="category">Kategori</label>
          <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Harga</label>
            <input type="number" id="price" name="price" placeholder="Contoh: 15000" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stok Awal</label>
            <input type="number" id="stock" name="stock" placeholder="Contoh: 100" value={formData.stock} onChange={handleChange} required />
          </div>
        </div>
        <div className="actions-row">
          <button type="button" onClick={onClose} className="button-secondary">Batal</button>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default MenuFormModal;