// LOKASI: src/services/menu.js
import api from './api';

export const getAllMenus = async () => {
  try {
    const response = await api.get('/management/menus');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar menu:", error);
    throw error.response?.data?.message || "Gagal mengambil daftar menu.";
  }
};