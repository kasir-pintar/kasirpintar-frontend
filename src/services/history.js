// LOKASI: src/services/history.js

import api from './api';

/**
 * Mengambil riwayat transaksi dengan filter dan pagination.
 * * @param {object} params - Objek parameter
* ... (parameter lainnya) ...
 * @param {number} [params.limit] - Jumlah data per halaman
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
  if (params.date) {
    query.append('date', params.date);
  }
  
  // 2. (PERUBAHAN DI SINI) Tentukan limit per halaman secara dinamis
  // Backend akan otomatis default ke 10 jika kita tidak kirim
  if (params.limit) {
    query.append('limit', params.limit);
  }
  // baris 'query.append('limit', 10);' yang lama DIHAPUS

  // 3. Kirim request
  return api.get(`/reports/transactions?${query.toString()}`);
};