// LOKASI: src/services/user.js
import api from './api';

// Mengambil semua user
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data; // <-- Pastikan mengembalikan .data
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    // Lemparkan error agar bisa ditangkap di halaman
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// Membuat user baru
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data; // <-- Pastikan mengembalikan .data
  } catch (error) {
    console.error("Gagal membuat user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// Memperbarui user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data; // <-- Pastikan mengembalikan .data
  } catch (error) {
    console.error("Gagal memperbarui user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// Menghapus user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data; // <-- Pastikan mengembalikan .data
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};