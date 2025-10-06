// LOKASI: src/pages/AnalyticsPage/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllMenus } from '../../services/menu';
import { getSalesForecast } from '../../services/forecast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './AnalyticsPage.scss';
import { FaInfoCircle } from 'react-icons/fa'; // Import ikon

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
      const prediction = await getSalesForecast(selectedProduct, 7);
      setForecastData(prediction);
    } catch (err) {
      setForecastError(err.toString());
    } finally {
      setForecastLoading(false);
    }
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
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Estimasi Jumlah Unit Terjual'
        }
      }
    }
  };

  const forecastChartData = useMemo(() => {
    return {
      labels: (forecastData || []).map(pred => new Date(pred.ds + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Prediksi Unit Terjual',
        data: (forecastData || []).map(pred => pred.yhat),
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
        <p>Gunakan Machine Learning untuk mendapatkan wawasan bisnis di masa depan.</p>
      </div>

      <div className="forecast-panel card">
        <h3>Prediksi Penjualan Produk</h3>
        <p>Pilih produk untuk melihat estimasi penjualan 7 hari ke depan berdasarkan data historis.</p>
        <div className="forecast-controls">
          <select 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
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
        {forecastData && (
          <>
            <div className="forecast-chart-container">
              <Bar options={forecastChartOptions} data={forecastChartData} />
            </div>
            <div className="prediction-explanation">
              <h4><FaInfoCircle /> Memahami Hasil Prediksi</h4>
              <ul>
                <li><strong>What (Apa):</strong> Grafik di atas adalah <strong>estimasi jumlah unit</strong> dari produk <strong>"{selectedProduct}"</strong> yang kemungkinan akan terjual setiap hari selama 7 hari ke depan.</li>
                <li><strong>Why (Mengapa):</strong> Prediksi ini dibuat dengan menganalisis <strong>pola penjualan historis</strong> produk ini. Model mempelajari tren harian (misalnya, apakah penjualan cenderung naik di akhir pekan) dan pola keseluruhan dari data yang ada di database Anda.</li>
                <li><strong>When (Kapan):</strong> Angka prediksi ini berlaku untuk <strong>7 hari ke depan</strong>, dimulai dari besok.</li>
                <li><strong>Who (Siapa):</strong> Hasil ini ditujukan untuk <strong>Manajer Outlet</strong> sebagai alat bantu pengambilan keputusan.</li>
                <li><strong>Where (Di mana):</strong> Analisis ini berlaku untuk data penjualan di **outlet Anda saat ini**.</li>
                <li><strong>How (Bagaimana):</strong> Anda dapat menggunakan informasi ini untuk merencanakan <strong>jumlah stok bahan baku</strong> yang perlu disiapkan, mengatur <strong>jadwal staf</strong> di hari yang diprediksi ramai, atau merancang **strategi promosi** (misalnya, diskon di hari yang diprediksi sepi).</li>
              </ul>
              <p className="disclaimer"><strong>Disclaimer:</strong> Ini adalah prediksi matematis dan bukan jaminan. Angka sebenarnya dapat bervariasi tergantung pada faktor-faktor tak terduga seperti cuaca, acara khusus, dll.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;