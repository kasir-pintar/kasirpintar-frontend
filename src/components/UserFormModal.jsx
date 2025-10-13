import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';
import './UserFormModal.scss';

Modal.setAppElement('#root');

function UserFormModal({ isOpen, onClose, onSubmit, initialData, currentUser }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'cashier', outlet_id: '' });
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [managerOutletName, setManagerOutletName] = useState('');
  const isEditing = !!initialData;

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await api.get('/outlets/');
        const outletsData = response.data || [];
        setOutlets(outletsData);

        if (currentUser?.role === 'manager') {
            const managerOutlet = outletsData.find(o => o.ID === currentUser.outlet_id);
            setManagerOutletName(managerOutlet?.Name || 'Outlet Saya');
        }
      } catch (error) {
        toast.error("Gagal memuat daftar outlet.");
      }
    };

    if (isOpen) {
      if (outlets.length === 0) {
        fetchOutlets();
      }

      if (isEditing) {
        setFormData({
          name: initialData.Name || '',
          email: initialData.Email || '',
          password: '',
          role: initialData.Role || 'cashier',
          outlet_id: initialData.OutletID || ''
        });
      } else {
        const newOutletId = currentUser?.role === 'manager' ? currentUser.outlet_id : '';
        const defaultRole = currentUser?.role === 'manager' ? 'cashier' : 'cashier';
        setFormData({ name: '', email: '', password: '', role: defaultRole, outlet_id: newOutletId });
      }
    }
  }, [isOpen, initialData, isEditing, currentUser, outlets.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.outlet_id) {
        toast.error("Outlet wajib diisi.");
        return;
    }
    if (!isEditing && !formData.password) {
      toast.error("Password wajib diisi untuk user baru.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password;
      }
      payload.outlet_id = parseInt(payload.outlet_id, 10);
      await onSubmit(payload);
    } catch (error) {
       // Error toast ditangani di halaman utama
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="user-form-modal" overlayClassName="user-form-modal-overlay">
      <h2>{isEditing ? 'Edit User' : 'Tambah User Baru'}</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Nama Lengkap</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Kosongkan jika tidak ingin diubah' : ''} required={!isEditing} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">Peran (Role)</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} disabled={currentUser?.role === 'manager'}>
              {currentUser?.role === 'manager' ? (
                <option value="cashier">Kasir</option>
              ) : (
                <>
                  <option value="cashier">Kasir</option>
                  <option value="manager">Manajer</option>
                  <option value="admin">Admin</option>
                </>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="outlet_id">Outlet</label>
            {currentUser?.role === 'manager' ? (
              <input type="text" value={managerOutletName} disabled />
            ) : (
              <select id="outlet_id" name="outlet_id" value={formData.outlet_id} onChange={handleChange} required>
                <option value="" disabled>Pilih Outlet</option>
                {outlets.map(outlet => (
                  <option key={outlet.ID} value={outlet.ID}>{outlet.Name}</option>
                ))}
              </select>
            )}
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

export default UserFormModal;