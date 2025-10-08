// LOKASI: src/pages/AnalyticsPage/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllMenus } from '../../services/menu';
import { getSalesForecast } from '../../services/forecast';
import { getBasketAnalysis } from '../../services/analytics';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './AnalyticsPage.scss';
import { FaInfoCircle, FaArrowUp, FaArrowDown, FaEquals, FaShoppingCart } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsPage() {
  // State untuk Prediksi Penjualan
  const [menus, setMenus] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(''); 
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');

  // State untuk Analisis Keranjang Belanja
  const [basketData, setBasketData] = useState(null);
  const [basketLoading, setBasketLoading] = useState(false);
  const [basketError, setBasketError] = useState('');

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
  
  const handleGetBasketAnalysis = async () => {
    try {
      setBasketLoading(true);
      setBasketError('');
      setBasketData(null);
      const analysisResult = await getBasketAnalysis();
      setBasketData(analysisResult);
    } catch (err) {
      setBasketError(err.toString());
    } finally {
      setBasketLoading(false);
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
        <h1>Analitik & Prediksi</h1>
        <p>Gunakan data historis untuk mendapatkan wawasan bisnis di masa depan.</p>
      </div>

      {/* Panel Prediksi Penjualan */}
      <div className="forecast-panel card">
        <h3>Prediksi Penjualan Produk</h3>
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
              <div className="daily-breakdown">
                {forecastData.map(day => (
                  <div key={day.ds} className="day-card">
                    <div className="day-header">
                      <span className="date">{new Date(day.ds + 'T00:00:00').toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                      <span className="day-name">{getDayName(day.ds)}</span>
                    </div>
                    <div className="prediction-value">{day.yhat} <span>unit</span></div>
                    <div className="explanation-details">
                      <p>Mengapa {day.yhat} unit?</p>
                      <ul>
                        <li>
                          <FaEquals className="icon trend" />
                          <span>Tren penjualan dasar sekitar <strong>{(day.trend || 0).toFixed(1)}</strong> unit.</span>
                        </li>
                        <li className={(day.weekly || 0) >= 0 ? 'positive' : 'negative'}>
                          {(day.weekly || 0) >= 0 ? <FaArrowUp className="icon positive" /> : <FaArrowDown className="icon negative" />}
                          <span>
                            Dipengaruhi efek hari <strong>{getDayName(day.ds)}</strong> sebesar <strong>{(day.weekly || 0) > 0 ? '+' : ''}{(day.weekly || 0).toFixed(1)}</strong> unit.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <p className="disclaimer">
                <strong>Disclaimer:</strong> Ini adalah prediksi matematis dan bukan jaminan. Angka sebenarnya dapat bervariasi.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Panel Analisis Keranjang Belanja */}
      <div className="basket-analysis-panel card">
        <h3><FaShoppingCart /> Analitik Keranjang Belanja</h3>
        <p>Temukan pasangan produk yang paling sering dibeli bersama oleh pelanggan untuk membuat strategi bundling atau promosi.</p>
        <div className="analysis-controls">
          <button onClick={handleGetBasketAnalysis} disabled={basketLoading}>
            {basketLoading ? 'Menganalisis...' : 'Jalankan Analisis'}
          </button>
        </div>
        
        {basketError && <p className="error-message small">{basketError}</p>}

        {basketData && (
          <div className="analysis-result">
            <h5>Top 10 Pasangan Produk Terlaris</h5>
            {basketData.length > 0 ? (
              <ul className="product-pairs-list">
                {basketData.map((pair, index) => (
                  <li key={index}>
                    <div className="pair-names">
                      <span>{pair.product_1}</span> + <span>{pair.product_2}</span>
                    </div>
                    <div className="pair-frequency">
                      {pair.frequency}x dibeli bersama
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Tidak ditemukan pasangan produk yang signifikan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;