// src/services/cashier.js
import api from './api';

/**
 * Ambil menu kasir
 */
export const fetchMenus = async () => {
  const response = await api.get('/management/menus');
  return response.data;
};

/**
 * Buat transaksi
 */
export const createTransaction = async (payload) => {
  const response = await api.post('/cashier/transactions', payload);
  return response.data;
};

/**
 * Cek status transaksi
 */
export const checkTransactionStatus = async (invoice) => {
  const response = await api.get(
    `/cashier/transactions/status/${invoice}`
  );
  return response.data;
};

/**
 * Preview transaksi
 */
export const previewTransaction = async (payload) => {
  const response = await api.post(
    '/cashier/transactions/preview',
    payload
  );
  return response.data;
};
