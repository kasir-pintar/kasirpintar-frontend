// LOKASI: src/services/analytics.js
import api from './api';

// Fungsi untuk Analisis Keranjang Belanja
export const getBasketAnalysis = async () => {
  try {
    const response = await api.get('/reports/basket-analysis');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data analisis keranjang:", error);
    throw error.response?.data?.message || "Gagal menghubungi layanan analisis keranjang.";
  }
};

// Fungsi untuk Analisis Waktu Sibuk
export const getBusyHours = async () => {
  try {
    const response = await api.get('/reports/busy-hours');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data waktu sibuk:", error);
    throw error.response?.data?.message || "Gagal menghubungi layanan waktu sibuk.";
  }
};

// --- FUNGSI BARU UNTUK ANALISIS PELANGGAN (RFM) ---
export const getCustomerSegmentation = async () => {
  try {
    const response = await api.get('/reports/customer-segmentation');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data segmentasi pelanggan:", error);
    throw error.response?.data?.message || "Gagal menghubungi layanan segmentasi pelanggan.";
  }
};