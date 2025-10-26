// LOKASI: src/services/history.js
import api from './api';

export const fetchTransactions = async (query, outletId) => {
  // Gunakan URLSearchParams untuk membangun query string dengan bersih
  const params = new URLSearchParams();
  
  if (query) {
    params.append('search', query);
  }
  
  // Tambahkan 'outlet_id' jika ada (terutama untuk owner)
  if (outletId) {
    params.append('outlet_id', outletId);
  }

  // Kirim query sebagai parameter URL
  const response = await api.get(`/reports/transactions?${params.toString()}`);
  return response.data;
};