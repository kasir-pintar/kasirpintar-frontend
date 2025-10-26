import api from './api';

/**
 * Helper untuk membuat config dengan query parameter
 * @param {string | number} outletId - ID outlet (opsional)
 * @returns {object} - Konfigurasi Axios
 */
const getConfig = (outletId) => {
  const config = {
    params: {},
  };
  
  // Backend akan otomatis filter untuk non-owner.
  // Kita hanya perlu kirim jika owner memilih outlet.
  if (outletId) {
    config.params.outlet_id = outletId;
  }
  return config;
};

/**
 * Mengambil data analisis keranjang belanja.
 */
export const getBasketAnalysis = async (outletId) => {
  // Gunakan 'api.get' sesuai di main.go
  const res = await api.get('/reports/basket-analysis', getConfig(outletId));
  return res.data;
};

/**
 * Mengambil data jam sibuk (busy hours).
 */
export const getBusyHours = async (outletId) => {
  const res = await api.get('/reports/busy-hours', getConfig(outletId));
  return res.data;
};

/**
 * Mengambil data segmentasi pelanggan.
 */
export const getCustomerSegmentation = async (outletId) => {
  const res = await api.get('/reports/customer-segmentation', getConfig(outletId));
  return res.data;
};