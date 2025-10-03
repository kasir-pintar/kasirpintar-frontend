// LOKASI: src/services/reports.js
import api from './api';

export const fetchTransactions = async () => {
  try {
    const response = await api.get('/reports/transactions');
    return response.data;
  } catch (error) {
    throw error;
  }
};