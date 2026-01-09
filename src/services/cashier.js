// src/services/cashier.js
import api from './api';

/**
 * Mengambil semua menu untuk kasir
 */
export const fetchMenus = async () => {
  try {
    const response = await api.get('/management/menus');
    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error.response?.data || error;
  }
};

/**
 * Membuat transaksi
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/cashier/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cek status transaksi
 */
export const checkTransactionStatus = async (invoiceNumber) => {
  try {
    const response = await api.get(
      `/cashier/transactions/status/${invoiceNumber}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Preview transaksi
 */
export const previewTransaction = async (payload) => {
  try {
    const response = await api.post(
      '/cashier/transactions/preview',
      payload
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
