// LOKASI: src/services/cashier.js
import api from './api';

// Fungsi untuk mengambil semua menu yang tersedia untuk kasir
export const fetchMenus = async () => {
  try {
    // Ingat, di backend rute untuk mengambil menu adalah /management/menus
    // dan bisa diakses oleh kasir (jika kita izinkan), manager, dan admin.
    // Mari kita asumsikan kasir juga butuh akses ini untuk menampilkan menu.
    // Kita akan sesuaikan backend jika perlu.
    const response = await api.get('/management/menus'); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mengirim data transaksi baru
export const createTransaction = async (items) => {
  try {
    const response = await api.post('/cashier/transactions', { items });
    return response.data;
  } catch (error) {
    throw error;
  }
};