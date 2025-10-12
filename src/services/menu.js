// LOKASI: src/services/menu.js
import api from './api';

// Mengambil semua menu
export const getAllMenus = async () => {
  try {
    // Endpoint ini sudah ada dan digunakan oleh halaman kasir
    const response = await api.get('/management/menus');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data menu:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan menu.";
  }
};

// Membuat menu baru
export const createMenu = async (menuData) => {
  try {
    const response = await api.post('/management/menus', menuData);
    return response.data;
  } catch (error) {
    console.error("Gagal membuat menu:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan menu.";
  }
};

// Memperbarui menu yang sudah ada
export const updateMenu = async (menuId, menuData) => {
  try {
    const response = await api.put(`/management/menus/${menuId}`, menuData);
    return response.data;
  } catch (error) {
    console.error("Gagal memperbarui menu:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan menu.";
  }
};

// Menghapus menu
export const deleteMenu = async (menuId) => {
  try {
    const response = await api.delete(`/management/menus/${menuId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus menu:", error);
    throw error.response?.data?.error || "Gagal menghubungi layanan menu.";
  }
};