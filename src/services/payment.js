// LOKASI: src/services/payment.js (File Baru)

import api from './api'; // Pastikan path ini benar ke file setup Axios Anda

/**
 * Meminta pembuatan tagihan QRIS ke backend.
 * @param {object} data - Objek berisi totalAmount
 * @param {number} data.total_amount - Total yang harus dibayar
 * @returns {Promise<object>} Promise Axios
 */
export const createQRPayment = (data) => {
  return api.post('/payment/qris', data);
};