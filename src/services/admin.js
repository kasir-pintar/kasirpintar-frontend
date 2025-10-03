// LOKASI: src/services/admin.js
import api from './api';

// Fungsi untuk mengambil semua data user
export const fetchUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk membuat user baru
export const createUser = async (userData) => {
    try {
        // Endpoint untuk membuat user adalah /admin/users, bukan /register
        const response = await api.post('/admin/users', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
}