// LOKASI: src/services/user.js
import api from './api';

// URL diubah dari /admin/users menjadi /users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// URL diubah dari /admin/users/archived menjadi /users/archived
export const getArchivedUsers = async () => {
  try {
    const response = await api.get('/users/archived');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data arsip user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan arsip.";
  }
};

// Menggunakan nama fungsi registerUser agar konsisten dengan backend
// URL diubah dari /admin/users menjadi /users
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error("Gagal membuat user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// URL diubah dari /admin/users/:id menjadi /users/:id
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Gagal memperbarui user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// URL diubah dari /admin/users/:id menjadi /users/:id
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan user.";
  }
};

// URL diubah dari /admin/users/:id/restore menjadi /users/:id/restore
export const restoreUser = async (userId) => {
  try {
    const response = await api.patch(`/users/${userId}/restore`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengembalikan user:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan restore.";
  }
};

// URL diubah dari /admin/users/:id/permanent menjadi /users/:id/permanent
export const permanentDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/permanent`);
      return response.data;
    } catch (error) {
      console.error("Gagal menghapus user permanen:", error);
      throw error.response?.data?.error || "Gagal menghubungi layanan hapus permanen.";
    }
};

// Fungsi ini sudah benar, tidak perlu diubah
export const changePassword = async (passwordData) => {
    try {
      const response = await api.patch('/users/me/password', passwordData);
      return response.data;
    } catch (error) {
      console.error("Gagal mengubah password:", error);
      throw error.response?.data?.error || "Gagal menghubungi layanan.";
    }
};

export const getAvailableManagers = async () => {
  try {
    // Memanggil endpoint baru yang kita buat di backend
    const response = await api.get('/users/managers');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data manajer:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan.";
  }
};