// LOKASI: src/services/analytics.js
import api from './api';

export const getBasketAnalysis = async () => {
  try {
    const response = await api.get('/reports/basket-analysis');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data analisis keranjang:", error);
    throw error.response?.data?.message || "Gagal menghubungi layanan analisis.";
  }
};