// LOKASI: src/pages/AnalyticsPage/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllMenus } from '../../services/menu';
import { getSalesForecast } from '../../services/forecast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './AnalyticsPage.scss';
import { FaInfoCircle, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsPage() {
  const [menus, setMenus] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(''); 
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menuData = await getAllMenus();
        setMenus(menuData || []);
      } catch (err) {
        console.error("Gagal memuat daftar menu:", err);
        setForecastError("Gagal memuat daftar menu.");
      }
    };
    fetchMenus();
  }, []);

  const handleGetForecast = async () => {
    if (!selectedProduct) {
      setForecastError("Silakan pilih produk terlebih dahulu.");
      return;
    }
    try {
      setForecastLoading(true);
      setForecastError('');
      setForecastData(null);
      const predictionResponse = await getSalesForecast(selectedProduct, 7);
      
      if (Array.isArray(predictionResponse)) {
        setForecastData(predictionResponse);
      } else {
        setForecastData(null);
        setForecastError(predictionResponse.message || "Terjadi kesalahan saat membuat prediksi.");
      }
    } catch (err) {
      setForecastData(null);
      const errorMessage = err.response?.data?.message || err.toString();
      setForecastError(errorMessage);
    } finally {
      setForecastLoading(false);
    }
  };

  const getDayName = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' });
  };
  
  const forecastChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `Prediksi Penjualan (Unit) untuk ${selectedProduct}` },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Estimasi Jumlah Unit Terjual' }
      }
    }
  };

  const forecastChartData = useMemo(() => {
    const data = Array.isArray(forecastData) ? forecastData : [];
    return {
      labels: data.map(pred => new Date(pred.ds + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Prediksi Unit Terjual',
        data: data.map(pred => pred.yhat),
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1,
      }],
    };
  }, [forecastData, selectedProduct]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        {/* --- PERUBAHAN UTAMA DI SINI --- */}
        <h1>Prediksi Penjualan</h1>
        <p>Gunakan Machine Learning untuk mengestimasi penjualan produk di masa depan.</p>
      </div>

      <div className="forecast-panel card">
        <h3>Buat Prediksi Baru</h3>
        <p>Pilih produk untuk melihat estimasi penjualan 7 hari ke depan.</p>
        <div className="forecast-controls">
          <select 
            value={selectedProduct} 
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setForecastData(null); 
            }}
            disabled={menus.length === 0}
            className={!selectedProduct ? 'placeholder' : ''}
          >
            <option value="" disabled>Pilih menu di sini...</option>
            {menus.map(menu => <option key={menu.ID} value={menu.Name}>{menu.Name}</option>)}
          </select>
          <button onClick={handleGetForecast} disabled={forecastLoading || !selectedProduct}>
            {forecastLoading ? 'Memprediksi...' : 'Buat Prediksi'}
          </button>
        </div>
        
        {forecastError && <p className="error-message small">{forecastError}</p>}
        
        {forecastData && Array.isArray(forecastData) && !forecastLoading && (
          <>
            <div className="forecast-chart-container">
              <Bar options={forecastChartOptions} data={forecastChartData} />
            </div>
            <div className="prediction-explanation">
              <h4><FaInfoCircle /> Memahami Hasil Prediksi</h4>
              <p className="explanation-summary">
                Grafik di atas adalah <strong>estimasi jumlah unit</strong> dari produk <strong>"{selectedProduct}"</strong> yang kemungkinan akan terjual setiap hari. Prediksi ini dibuat dengan menganalisis <strong>pola penjualan historis</strong> di outlet Anda dan ditujukan bagi <strong>Manajer</strong> sebagai alat bantu merencanakan stok dan jadwal staf.
              </p>
              
              <h5>Rincian Prediksi per Hari</h5>
              
              <div className="daily-breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Prediksi (Unit)</th>
                      <th>Komponen Analisis ("Mengapa?")</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map(day => (
                      <tr key={day.ds}>
                        <td>
                          <strong>{getDayName(day.ds)}</strong>
                          <br />
                          <small>{new Date(day.ds + 'T00:00:00').toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</small>
                        </td>
                        <td className="prediction-value">
                          {day.yhat}
                        </td>
                        <td className="explanation-details">
                          <ul>
                            <li>
                              <FaEquals className="icon trend" />
                              <span>Tren Dasar: <strong>{(day.trend || 0).toFixed(1)}</strong></span>
                            </li>
                            <li className={(day.weekly || 0) >= 0 ? 'positive' : 'negative'}>
                              {(day.weekly || 0) >= 0 ? <FaArrowUp className="icon positive" /> : <FaArrowDown className="icon negative" />}
                              <span>
                                Efek Hari: <strong>{(day.weekly || 0) > 0 ? '+' : ''}{(day.weekly || 0).toFixed(1)}</strong>
                              </span>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="disclaimer">
                <strong>Disclaimer:</strong> Ini adalah prediksi matematis dan bukan jaminan. Angka sebenarnya dapat bervariasi.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;