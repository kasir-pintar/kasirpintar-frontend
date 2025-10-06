// LOKASI: src/services/forecast.js
import api from './api';

export const getSalesForecast = async (productName, periods = 7) => {
  try {
    const response = await api.post('/reports/forecast', {
      product_name: productName,
      periods: periods,
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data prediksi:", error);
    throw error.response?.data?.message || "Gagal menghubungi layanan prediksi.";
  }
};