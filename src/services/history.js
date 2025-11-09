// LOKASI: src/services/history.js (LENGKAP - Versi Upgrade Range Tanggal)

import api from './api';

/**
 * Mengambil riwayat transaksi dengan filter dan pagination.
 * @param {object} params - Objek parameter
 * @param {string} [params.search] - Kata kunci pencarian
 * @param {string} [params.outletId] - ID outlet
 * @param {number} [params.page] - Halaman saat ini
 * @param {number} [params.limit] - Jumlah data per halaman
 * @param {string} [params.start_date] - Tanggal mulai (YYYY-MM-DD)
 * @param {string} [params.end_date] - Tanggal selesai (YYYY-MM-DD)
 * @returns {Promise<object>} Promise Axios (bukan response.data)
 */
export const fetchTransactions = (params) => {
  // Gunakan URLSearchParams untuk membangun query string dengan bersih
  const query = new URLSearchParams();

  // 1. Tambahkan parameter dinamis dari objek 'params'
  if (params.search) {
    query.append('search', params.search);
  }
  if (params.outletId) {
    query.append('outlet_id', params.outletId);
  }
  if (params.page) {
    query.append('page', params.page);
  }
  
  // --- 🛑 PERUBAHAN DI SINI 🛑 ---
  // Hapus 'date'
  // if (params.date) {
  //   query.append('date', params.date);
  // }
  
  // Tambahkan 'start_date' dan 'end_date'
  if (params.start_date) {
    query.append('start_date', params.start_date);
  }
  if (params.end_date) {
    query.append('end_date', params.end_date);
  }
  // --- 🛑 AKHIR PERUBAHAN 🛑 ---

  if (params.limit) {
    query.append('limit', params.limit);
  }

  // 3. Kirim request
  return api.get(`/reports/transactions?${query.toString()}`);
};