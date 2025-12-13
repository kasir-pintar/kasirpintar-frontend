import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './TaxFormModal.scss';

function TaxFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('');
  const [ratePercent, setRatePercent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setRegion(initialData.region || '');
      setRatePercent(initialData.rate_percent !== undefined ? String(initialData.rate_percent) : '');
      setIsActive(initialData.is_active === undefined ? true : !!initialData.is_active);
      setNote(initialData.note || '');
    } else {
      setCode('');
      setRegion('');
      setRatePercent('');
      setIsActive(true);
      setNote('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!code || code.trim().length < 2) e.code = 'Kode harus diisi (min 2 karakter)';
    if (!region || region.trim().length < 2) e.region = 'Region harus diisi (min 2 karakter)';
    if (ratePercent === '') e.rate_percent = 'Tarif (%) harus diisi';
    else if (isNaN(parseFloat(ratePercent))) e.rate_percent = 'Tarif harus berupa angka';
    else if (parseFloat(ratePercent) < 0) e.rate_percent = 'Tarif tidak boleh negatif';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      code: code.trim(),
      region: region.trim(),
      rate_percent: parseFloat(ratePercent),
      is_active: !!isActive,
      note: note ? note.trim() : null
    };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Tarif Pajak' : 'Tambah Tarif Pajak'}</h2>
          <button onClick={onClose} className="close-button"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Kode</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
              {errors.code && <p className="error-message">{errors.code}</p>}
            </div>

            <div className="form-group">
              <label>Region</label>
              <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />
              {errors.region && <p className="error-message">{errors.region}</p>}
            </div>

            <div className="form-group">
              <label>Tarif (%)</label>
              <input type="number" step="0.01" value={ratePercent} onChange={(e) => setRatePercent(e.target.value)} />
              {errors.rate_percent && <p className="error-message">{errors.rate_percent}</p>}
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={isActive ? '1' : '0'} onChange={(e) => setIsActive(e.target.value === '1')}>
                <option value="1">Aktif</option>
                <option value="0">Non-Aktif</option>
              </select>
            </div>

            <div className="form-group">
              <label>Catatan (opsional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-submit"><FaSave /> {initialData ? 'Simpan Perubahan' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaxFormModal;
