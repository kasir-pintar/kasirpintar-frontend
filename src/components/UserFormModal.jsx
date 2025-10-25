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
        // initialData.OutletID bisa null, '|| ""' akan menanganinya
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

  // --- VALIDASI DIPERBARUI ---
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nama tidak boleh kosong';
    if (!email.trim()) newErrors.email = 'Email tidak boleh kosong';
    if (!isEditing && !password) newErrors.password = 'Password wajib diisi untuk user baru';

    // Outlet HANYA wajib jika:
    // 1. Peran yang dipilih adalah 'staf' (bukan admin/owner)
    // 2. DAN user yang sedang login adalah 'admin' or 'owner' (yang bisa memilih outlet)
    if ((role === 'cashier' || role === 'branch_manager') && 
        (currentUserRole === 'owner' || currentUserRole === 'admin') && 
        !outletId) {
      newErrors.outletId = 'Outlet harus dipilih untuk staf';
    }
    return newErrors;
  };

  // --- LOGIKA SUBMIT DIPERBARUI ---
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Tentukan outletId yang akan dikirim
    let finalOutletId = null; // Default ke null (untuk admin/owner)
    
    // Hanya isi OutletID jika perannya BUKAN admin/owner
    if (role === 'cashier' || role === 'branch_manager') {
      if (currentUserRole === 'owner' || currentUserRole === 'admin') {
         // Pastikan outletId tidak kosong sebelum parsing
         if(outletId) {
             finalOutletId = parseInt(outletId, 10);
         }
      } else if (currentUserRole === 'branch_manager') {
        // Jika branch manager yg submit, backend akan otomatis set ID outlet-nya
        // Mengirim 0 atau null tidak masalah, backend akan menanganinya
        finalOutletId = 0; // Kirim 0 agar konsisten dengan `UserInput` lama
      }
    }

    const payload = {
      name: name,
      email: email,
      password: password,
      role: role,
      outlet_id: finalOutletId, // Kirim ID (atau null)
    };
    
    // Pastikan payload.outlet_id benar-benar null jika rolenya admin/owner
    if (role === 'admin' || role === 'owner') {
        payload.outlet_id = null;
    }

    // Hapus password jika tidak diisi saat edit
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
                {/* Tampilkan semua pilihan untuk Owner/Admin */}
                {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                  <>
                    <option value="cashier">Kasir</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </>
                )}
                {/* Branch manager hanya bisa membuat kasir */}
                {currentUserRole === 'branch_manager' && (
                  <option value="cashier">Kasir</option>
                )}
              </select>
            </div>

            {/* --- LOGIKA TAMPILAN BARU --- */}
            {/* Tampilkan dropdown outlet HANYA JIKA: */}
            {/* 1. User saat ini adalah Owner/Admin */}
            {/* 2. DAN Peran yang DIPILIH adalah Staf (bukan Owner/Admin) */}
            {(currentUserRole === 'owner' || currentUserRole === 'admin') &&
             (role === 'cashier' || role === 'branch_manager') && (
              <div className="form-group">
                <label htmlFor="outlet_id">Outlet</label>
                <select id="outlet_id" value={outletId} onChange={(e) => setOutletId(e.target.value)} required={!isEditing}> {/* Required hanya saat tambah baru */}
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