// LOKASI: src/pages/AnalyticsPage/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllMenus } from '../../services/menu';
import { getSalesForecast } from '../../services/forecast';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './AnalyticsPage.scss';
import { FaInfoCircle, FaArrowUp, FaArrowDown, FaEquals, FaCheckCircle, FaChartLine } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function AnalyticsPage() {
  const [menus, setMenus] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(''); 
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');

  // State baru untuk menampung semua data hasil prediksi
  const [predictionResult, setPredictionResult] = useState(null);

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
      setPredictionResult(null);
      
      // getSalesForecast sekarang mengembalikan { forecast, metrics, validation }
      const response = await getSalesForecast(selectedProduct, 7);
      
      if (response && response.forecast) {
        setPredictionResult(response);
      } else {
        setPredictionResult(null);
        setForecastError(response.message || "Terjadi kesalahan saat membuat prediksi.");
      }
    } catch (err) {
      setPredictionResult(null);
      const errorMessage = err.response?.data?.message || err.toString();
      setForecastError(errorMessage);
    } finally {
      setForecastLoading(false);
    }
  };

  const getDayName = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' });
  };
  
  // Opsi Grafik untuk Prediksi Masa Depan (Bar Chart)
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
    const data = predictionResult?.forecast || [];
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
  }, [predictionResult]);

  // Opsi dan Data untuk Grafik Validasi (Line Chart)
  const validationChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Performa Model: Penjualan Aktual vs. Hasil Prediksi (pada Data Historis)' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Unit Terjual' }
      }
    }
  };

  const validationChartData = useMemo(() => {
    const data = predictionResult?.validation || [];
    return {
      labels: data.map(item => new Date(item.ds + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
      datasets: [
        {
          label: 'Penjualan Aktual',
          data: data.map(item => item.y),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1
        },
        {
          label: 'Hasil Prediksi Model',
          data: data.map(item => item.yhat),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }
      ],
    };
  }, [predictionResult]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Prediksi Penjualan</h1>
        <p>Gunakan Machine Learning untuk mengestimasi penjualan produk di masa depan.</p>
      </div>

      <div className="forecast-panel card">
        <h3>Buat Prediksi Baru</h3>
        <p>Pilih produk untuk melihat estimasi penjualan dan akurasi model.</p>
        <div className="forecast-controls">
          <select 
            value={selectedProduct} 
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setPredictionResult(null); 
            }}
            disabled={menus.length === 0}
            className={!selectedProduct ? 'placeholder' : ''}
          >
            <option value="" disabled>Pilih menu di sini...</option>
            {menus.map(menu => <option key={menu.ID} value={menu.Name}>{menu.Name}</option>)}
          </select>
          <button onClick={handleGetForecast} disabled={forecastLoading || !selectedProduct}>
            {forecastLoading ? 'Memproses...' : 'Buat Prediksi & Evaluasi'}
          </button>
        </div>
        
        {forecastError && <p className="error-message small">{forecastError}</p>}
        
        {predictionResult && predictionResult.forecast && !forecastLoading && (
          <>
            {predictionResult.metrics && (
              <div className="metrics-panel">
                <h4><FaCheckCircle /> Metrik Akurasi Model</h4>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-value">{predictionResult.metrics.r2}</span>
                    <span className="metric-label">R-squared (R²)</span>
                    <span className="metric-desc">Seberapa baik model mengikuti data (mendekati 1 lebih baik).</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">{predictionResult.metrics.mae}</span>
                    <span className="metric-label">MAE</span>
                    <span className="metric-desc">Rata-rata kesalahan absolut (misal: prediksi meleset ~{predictionResult.metrics.mae.toFixed(2)} unit).</span>
                  </div>
                   <div className="metric-item">
                    <span className="metric-value">{predictionResult.metrics.rmse}</span>
                    <span className="metric-label">RMSE</span>
                    <span className="metric-desc">Akar rata-rata kuadrat error (mirip MAE tapi lebih menghukum error besar).</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">{(predictionResult.metrics.mape * 100).toFixed(2)}%</span>
                    <span className="metric-label">MAPE</span>
                    <span className="metric-desc">Rata-rata persentase error (seberapa besar error dibanding nilai aktual).</span>
                  </div>
                </div>
              </div>
            )}
            
            {predictionResult.validation && (
              <div className="validation-chart-container">
                <h4><FaChartLine /> Visualisasi Kinerja Model</h4>
                <Line options={validationChartOptions} data={validationChartData} />
              </div>
            )}

            <div className="prediction-explanation">
              <h4><FaInfoCircle /> Prediksi 7 Hari ke Depan</h4>
              <p className="explanation-summary">
                Berdasarkan model yang telah dievaluasi di atas, berikut adalah estimasi penjualan untuk <strong>"{selectedProduct}"</strong> di masa depan.
              </p>
              
              <div className="forecast-chart-container">
                <Bar options={forecastChartOptions} data={forecastChartData} />
              </div>
              
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
                    {predictionResult.forecast.map(day => (
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
                <strong>Disclaimer:</strong> Ini adalah prediksi matematis dan bukan jaminan.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;