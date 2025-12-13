// LOKASI: src/services/tax.js
import api from './api';

// Ambil semua tarif pajak
export const getAllTaxes = async (params) => {
  try {
    const res = await api.get('/tax', { params });
    return res.data?.data || [];
  } catch (error) {
    console.error('Gagal mengambil tarif pajak:', error);
    throw error.response?.data || { error: 'Gagal menghubungi layanan pajak.' };
  }
};

// Buat tarif pajak baru
export const createTax = async (payload) => {
  try {
    const res = await api.post('/tax', payload);
    return res.data;
  } catch (error) {
    console.error('Gagal membuat tarif pajak:', error);
    throw error.response?.data || { error: 'Gagal menghubungi layanan pajak.' };
  }
};

// Update tarif pajak
export const updateTax = async (id, payload) => {
  try {
    const res = await api.put(`/tax/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error('Gagal memperbarui tarif pajak:', error);
    throw error.response?.data || { error: 'Gagal menghubungi layanan pajak.' };
  }
};

// Delete tarif pajak
export const deleteTax = async (id) => {
  try {
    const res = await api.delete(`/tax/${id}`);
    return res.data;
  } catch (error) {
    console.error('Gagal menghapus tarif pajak:', error);
    throw error.response?.data || { error: 'Gagal menghubungi layanan pajak.' };
  }
};
