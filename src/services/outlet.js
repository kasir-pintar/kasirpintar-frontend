// LOKASI: src/services/outlet.js
import api from './api';

// Mengambil semua outlet
export const getAllOutlets = async () => {
  try {
    const response = await api.get('/outlets');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data outlet:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan outlet.";
  }
};

// Membuat outlet baru
export const createOutlet = async (outletData) => {
  try {
    const response = await api.post('/outlets', outletData);
    return response.data;
  } catch (error) {
    console.error("Gagal membuat outlet:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan outlet.";
  }
};

// Memperbarui outlet
export const updateOutlet = async (outletId, outletData) => {
  try {
    const response = await api.put(`/outlets/${outletId}`, outletData);
    return response.data;
  } catch (error) {
    console.error("Gagal memperbarui outlet:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan outlet.";
  }
};

// Menghapus outlet
export const deleteOutlet = async (outletId) => {
  try {
    const response = await api.delete(`/outlets/${outletId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus outlet:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan outlet.";
  }
};