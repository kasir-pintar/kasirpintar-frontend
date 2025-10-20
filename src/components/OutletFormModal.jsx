import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './OutletFormModal.scss';

function OutletFormModal({ isOpen, onClose, onSubmit, initialData }) {
  // Menggunakan useState untuk setiap input, bukan library tambahan
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  // Mengisi form dengan data awal saat mode edit
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAddress(initialData.address || '');
      setPhone(initialData.phone || '');
    } else {
      // Kosongkan form saat mode tambah baru
      setName('');
      setAddress('');
      setPhone('');
    }
    // Hapus error lama setiap kali modal dibuka
    setErrors({});
  }, [initialData, isOpen]);

  // Fungsi untuk validasi manual
  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Nama outlet tidak boleh kosong';
    if (!address) newErrors.address = 'Alamat tidak boleh kosong';
    if (!phone) {
      newErrors.phone = 'Nomor telepon tidak boleh kosong';
    } else if (!/^[0-9]+$/.test(phone)) {
      newErrors.phone = 'Nomor telepon hanya boleh berisi angka';
    }
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Hentikan submit jika ada error
    }

    // Jika tidak ada error, kirim data ke parent component
    onSubmit({ name, address, phone });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Outlet' : 'Tambah Outlet Baru'}</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nama Outlet</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && <p className="error-message">{errors.address}</p>}
            </div>
            <div className="form-group">
              <label>Nomor Telepon</label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-submit">
              <FaSave /> {initialData ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OutletFormModal;