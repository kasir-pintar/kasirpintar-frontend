// LOKASI: src/services/forecast.js
import api from './api';

export const getSalesForecast = async (productName, periods) => {
  try {
    // Panggil API backend Go
    const response = await api.post('/reports/forecast', {
      product_name: productName,
      periods: periods,
    });
    // Response.data sekarang berisi: { forecast, metrics, validation }
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data prediksi penjualan:", error);
    // Lemparkan pesan error agar bisa ditangkap di komponen
    throw error.response?.data?.message || "Gagal menghubungi layanan prediksi.";
  }
};