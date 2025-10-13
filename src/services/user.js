// LOKASI: src/services/user.js
import api from './api';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

export const getArchivedUsers = async () => {
  try {
    const response = await api.get('/admin/users/archived');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data arsip user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan arsip.";
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error("Gagal membuat user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Gagal memperbarui user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

export const restoreUser = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/restore`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengembalikan user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan restore.";
  }
};

export const permanentDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}/permanent`);
      return response.data;
    } catch (error) {
      console.error("Gagal menghapus user permanen:", error);
      throw error.response?.data?.error || "Gagal menghubungi layanan hapus permanen.";
    }
};

export const changePassword = async (passwordData) => {
    try {
      const response = await api.patch('/users/me/password', passwordData);
      return response.data;
    } catch (error) {
      console.error("Gagal mengubah password:", error);
      throw error.response?.data?.error || "Gagal menghubungi layanan.";
    }
};