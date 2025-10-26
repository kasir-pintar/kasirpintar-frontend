// LOKASI: src/services/forecast.js
import api from './api';

// --- PERBAIKAN: Tambahkan 'outletId' sebagai parameter ---
export const getSalesForecast = async (productName, periods, outletId) => {
  try {
    // Siapkan body request
    const body = {
      product_name: productName,
      periods: periods,
    };

    // --- PERBAIKAN: Tambahkan outlet_id ke body jika ada ---
    // Backend controller Anda mengharapkan ini, terutama dari owner
    if (outletId) {
      body.outlet_id = parseInt(outletId);
    }

    // Panggil API backend Go
    const response = await api.post('/reports/forecast', body);
    
    // Response.data sekarang berisi: { forecast, metrics, validation }
    return response.data;

  } catch (error) {
    console.error("Gagal mengambil data prediksi penjualan:", error);
    // Lemparkan pesan error agar bisa ditangkap di komponen
    throw error.response?.data?.message || "Gagal menghubungi layanan prediksi.";
  }
};