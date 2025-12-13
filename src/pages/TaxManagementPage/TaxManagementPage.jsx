import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getAllTaxes, createTax, updateTax, deleteTax } from '../../services/tax';
import TaxFormModal from '../../components/TaxFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { FaPlus, FaEdit, FaTrash, FaPercent, FaSearch } from 'react-icons/fa';
import './TaxManagementPage.scss';

function TaxManagementPage() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadTaxes = async () => {
    setLoading(true);
    try {
      const response = await getAllTaxes();
      setTaxes(response || []);
    } catch (error) {
      toast.error('Gagal memuat tarif pajak.');
      setTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const handleOpenForm = (tax = null) => {
    setSelectedTax(tax);
    setFormOpen(true);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTax(null);
  };

  const handleSave = async (data) => {
    const isEditing = !!selectedTax;
    try {
      if (isEditing) {
        await updateTax(selectedTax.id, data);
        toast.success('Tarif pajak berhasil diperbarui!');
      } else {
        await createTax(data);
        toast.success('Tarif pajak berhasil ditambahkan!');
      }
      loadTaxes();
      handleCloseForm();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Gagal menyimpan tarif pajak.');
    }
  };

  const handleOpenConfirm = (tax) => {
    setSelectedTax(tax);
    setConfirmOpen(true);
  };
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedTax(null);
  };
  const handleDelete = async () => {
    if (!selectedTax) return;
    try {
      await deleteTax(selectedTax.id);
      toast.success('Tarif pajak dihapus');
      loadTaxes();
      handleCloseConfirm();
    } catch (error) {
      toast.error('Gagal menghapus tarif pajak.');
    }
  };

  const filteredTaxes = useMemo(() => {
    if (!Array.isArray(taxes)) return [];
    const q = searchTerm.toLowerCase();
    return taxes.filter(t =>
      (t.code?.toLowerCase() || '').includes(q) ||
      (t.region?.toLowerCase() || '').includes(q) ||
      (String(t.rate_percent || '').toLowerCase()).includes(q) ||
      (t.note?.toLowerCase() || '').includes(q)
    );
  }, [taxes, searchTerm]);

  const paginatedTaxes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTaxes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTaxes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTaxes.length / itemsPerPage);
  const handleItemsPerPageChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Manajemen Pajak</h1>
        <button onClick={() => handleOpenForm()} className="add-btn"><FaPlus /> Tambah Pajak</button>
      </header>

      <div className="page-content">
        <div className="table-controls">
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari kode, region, atau catatan..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="items-per-page-selector">
            <label htmlFor="items-per-page">Tampilkan:</label>
            <select id="items-per-page" value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {loading ? (<p>Memuat data...</p>) :
          filteredTaxes.length === 0 ? (
            <div className="no-data"><FaPercent /><p>Tidak ada tarif pajak yang cocok.</p></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode</th>
                      <th>Region</th>
                      <th>Tarif (%)</th>
                      <th>Status</th>
                      <th>Catatan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTaxes.map((t, idx) => (
                      <tr key={t.id}>
                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td>{t.code}</td>
                        <td>{t.region}</td>
                        <td>{t.rate_percent}</td>
                        <td>{t.is_active ? 'Aktif' : 'Non-Aktif'}</td>
                        <td>{t.note || '-'}</td>
                        <td className="action-cell">
                          <button onClick={() => handleOpenForm(t)} className="action-btn edit-btn"><FaEdit /> Edit</button>
                          <button onClick={() => handleOpenConfirm(t)} className="action-btn delete-btn"><FaTrash /> Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination-controls">
                <span>Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}</span>
                <div className="pagination-buttons">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Sebelumnya</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Berikutnya</button>
                </div>
              </div>
            </>
          )}
      </div>

      {isFormOpen && (
        <TaxFormModal
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSave}
          initialData={selectedTax}
        />
      )}

      {isConfirmOpen && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleDelete}
          title="Konfirmasi Hapus"
          message={`Anda yakin ingin menghapus tarif "${selectedTax?.code}"?`}
        />
      )}
    </div>
  );
}

export default TaxManagementPage;
