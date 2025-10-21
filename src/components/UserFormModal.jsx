import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './UserFormModal.scss';

function UserFormModal({ isOpen, onClose, onSubmit, initialData, currentUserRole, outlets }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [outletId, setOutletId] = useState('');
  const [errors, setErrors] = useState({});

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setName(initialData.Name || '');
        setEmail(initialData.Email || '');
        setRole(initialData.Role || 'cashier');
        setOutletId(initialData.OutletID || '');
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setRole('cashier');
        setOutletId('');
      }
      setPassword('');
      setErrors({});
    }
  }, [isOpen, isEditing, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nama tidak boleh kosong';
    if (!email.trim()) newErrors.email = 'Email tidak boleh kosong';
    if (!isEditing && !password) newErrors.password = 'Password wajib diisi untuk user baru';
    if ((currentUserRole === 'owner' || currentUserRole === 'admin') && !outletId) {
      newErrors.outletId = 'Outlet harus dipilih';
    }
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    const payload = {
      name,
      email,
      password,
      role,
      outlet_id: (currentUserRole === 'owner' || currentUserRole === 'admin') ? parseInt(outletId, 10) : 0,
    };

    if (isEditing && !payload.password) {
      delete payload.password;
    }

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Staf' : 'Tambah Staf Baru'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleFormSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEditing ? 'Kosongkan jika tidak diubah' : ''} />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Peran (Role)</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                  <>
                    <option value="cashier">Kasir</option>
                    <option value="branch_manager">Branch Manager</option>
                  </>
                )}
                {currentUserRole === 'branch_manager' && (
                  <option value="cashier">Kasir</option>
                )}
              </select>
            </div>
            {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
              <div className="form-group">
                <label htmlFor="outlet_id">Outlet</label>
                <select id="outlet_id" value={outletId} onChange={(e) => setOutletId(e.target.value)} required>
                  <option value="" disabled>Pilih Outlet</option>
                  {outlets.map(outlet => (
                    <option key={outlet.ID} value={outlet.ID}>{outlet.Name}</option>
                  ))}
                </select>
                {errors.outletId && <p className="error-message">{errors.outletId}</p>}
              </div>
            )}
          </div>
          <div className="actions-row">
            <button type="button" onClick={onClose} className="button-secondary">Batal</button>
            <button type="submit" className="button-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;