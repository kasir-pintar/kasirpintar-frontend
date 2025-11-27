import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getAllOutlets } from '../services/outlet'; 
import './MenuFormModal.scss';

Modal.setAppElement('#root');

function MenuFormModal({ isOpen, onClose, onSubmit, initialData, userRole }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  });
  
  // State untuk fitur Multi-Outlet (Owner Only)
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  // --- LOGIKA DISABLE INPUT (PERBAIKAN DI SINI) ---
  
  // 1. Manager: Mati untuk Nama, Kategori, Harga (Hanya boleh update stok)
  const isProductInfoDisabled = userRole === 'branch_manager';
  
  // 2. Owner: SELALU MATI untuk Stok (Baik Create maupun Edit)
  // Owner tidak boleh input stok manual, default 0.
  const isStockDisabled = userRole === 'owner' || userRole === 'admin';

  // Fetch Outlets jika User adalah Owner/Admin DAN sedang mode Tambah Baru
  useEffect(() => {
    if (isOpen && !isEditing && (userRole === 'owner' || userRole === 'admin')) {
        const fetchOutlets = async () => {
            try {
                const data = await getAllOutlets();
                setOutlets(data || []);
            } catch (err) {
                console.error("Gagal load outlet", err);
            }
        };
        fetchOutlets();
    }
  }, [isOpen, isEditing, userRole]);

  // Reset Form saat modal dibuka
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
        // PERBAIKAN: Jika Owner tambah baru, Stock default 0
        setFormData({ 
            name: '', 
            category: '', 
            price: '', 
            stock: (userRole === 'owner' || userRole === 'admin') ? 0 : '' 
        });
        setSelectedOutlets([]); 
        setIsAllSelected(false);
      }
    }
  }, [isOpen, initialData, isEditing, userRole]);

  // Handler Checkbox Outlet
  const handleOutletToggle = (id) => {
      if (selectedOutlets.includes(id)) {
          setSelectedOutlets(prev => prev.filter(oid => oid !== id));
          setIsAllSelected(false);
      } else {
          setSelectedOutlets(prev => [...prev, id]);
      }
  };

  const handleSelectAll = () => {
      if (isAllSelected) {
          setSelectedOutlets([]);
      } else {
          setSelectedOutlets(outlets.map(o => o.ID));
      }
      setIsAllSelected(!isAllSelected);
  };

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
        // Pastikan stock terkirim sebagai 0 jika kosong/disabled
        stock: parseInt(formData.stock || 0, 10) 
      };

      // Jika Owner & Tambah Baru, masukkan array outlet_ids
      if (!isEditing && (userRole === 'owner' || userRole === 'admin')) {
          if (selectedOutlets.length === 0) {
              alert("Mohon pilih setidaknya satu outlet target.");
              setLoading(false);
              return;
          }
          payload.outlet_ids = selectedOutlets;
      }

      await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Judul Modal Dinamis
  let modalTitle = 'Tambah Menu Baru';
  if (isEditing) {
      modalTitle = userRole === 'branch_manager' ? 'Update Stok Menu' : 'Edit Menu';
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="menu-form-modal"
      overlayClassName="menu-form-modal-overlay"
    >
      <h2>{modalTitle}</h2>
      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-group">
          <label htmlFor="name">Nama Menu</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            autoFocus={!isProductInfoDisabled}
            disabled={isProductInfoDisabled} 
            className={isProductInfoDisabled ? 'input-disabled' : ''}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Kategori</label>
          <input 
            type="text" 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange}
            disabled={isProductInfoDisabled} 
            className={isProductInfoDisabled ? 'input-disabled' : ''}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Harga</label>
            <input 
                type="number" 
                id="price" 
                name="price" 
                placeholder="Contoh: 15000" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                disabled={isProductInfoDisabled} 
                className={isProductInfoDisabled ? 'input-disabled' : ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock">
                {/* Ubah Label agar informatif */}
                Stok {isStockDisabled ? '(Diatur Manager)' : ''}
            </label>
            <input 
                type="number" 
                id="stock" 
                name="stock" 
                placeholder="0" 
                value={formData.stock} 
                onChange={handleChange} 
                required 
                // PERBAIKAN: Gunakan variable baru yang selalu true untuk Owner
                disabled={isStockDisabled} 
                className={isStockDisabled ? 'input-disabled' : ''}
            />
          </div>
        </div>

        {/* BAGIAN CHECKBOX MULTI-OUTLET KHUSUS OWNER (Hanya saat Tambah Baru) */}
        {!isEditing && (userRole === 'owner' || userRole === 'admin') && (
            <div className="form-group outlet-selection-group">
                <label style={{marginBottom: '8px', display: 'block'}}>Pilih Outlet Target:</label>
                <div className="outlet-list-container">
                    <div className="outlet-item select-all">
                        <input 
                            type="checkbox" 
                            id="select-all" 
                            checked={isAllSelected} 
                            onChange={handleSelectAll} 
                        />
                        <label htmlFor="select-all"><strong>Pilih Semua Outlet</strong></label>
                    </div>
                    <div className="outlet-items-scroll">
                        {outlets.length > 0 ? outlets.map(outlet => (
                            <div key={outlet.ID} className="outlet-item">
                                <input 
                                    type="checkbox" 
                                    id={`outlet-${outlet.ID}`}
                                    checked={selectedOutlets.includes(outlet.ID)}
                                    onChange={() => handleOutletToggle(outlet.ID)}
                                />
                                <label htmlFor={`outlet-${outlet.ID}`}>{outlet.Name}</label>
                            </div>
                        )) : <p className="no-data-text">Memuat outlet...</p>}
                    </div>
                </div>
                <small className="helper-text">{selectedOutlets.length} outlet dipilih.</small>
            </div>
        )}

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