// LOKASI: src/services/history.js
import api from './api';

export const fetchTransactions = async (query) => {
    // Kirim query sebagai parameter URL
    const response = await api.get(`/reports/transactions?search=${query}`);
    return response.data;
};