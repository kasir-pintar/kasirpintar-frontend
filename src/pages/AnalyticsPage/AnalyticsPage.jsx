import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getAllMenus } from '../../services/menu';
import { getSalesForecast } from '../../services/forecast';
import { getAllOutlets } from '../../services/outlet';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  SubTitle,   
  Tooltip,
  Legend,
} from 'chart.js';
import './AnalyticsPage.scss';
import {
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaCheckCircle,
  FaChartLine,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const whiteBackgroundPlugin = {
  id: 'whiteBackground',
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  SubTitle,          
  Tooltip,
  Legend,
  whiteBackgroundPlugin
);

const getTokenData = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    console.error("Token tidak valid atau rusak:", e);
    return null;
  }
};

function AnalyticsPage() {

  const [user, setUser] = useState(getTokenData());
  const isOwner = user?.role === 'owner'; 

  const [menus, setMenus] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [outlets, setOutlets] = useState([]);
  
  const [selectedOutlet, setSelectedOutlet] = useState('');

  const selectedOutletName = useMemo(() => {
    if (!isOwner) return 'Semua Outlet';
    return (
      outlets.find(o => String(o.ID) === String(selectedOutlet))?.Name ||
      'Tidak diketahui'
    );
  }, [isOwner, selectedOutlet, outlets]);

  useEffect(() => {
    if (!isOwner) return; 
    const fetchOutlets = async () => {
      try {
        const res = await getAllOutlets();
        setOutlets(res || []);
      } catch (err) {
        console.error('Gagal memuat outlet:', err);
        toast.error('Gagal memuat daftar outlet.');
      }
    };
    fetchOutlets();
  }, [isOwner]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await getAllMenus(isOwner ? selectedOutlet : undefined);
        setMenus(response.data || []);
      } catch (err) {
        console.error('Gagal memuat daftar menu:', err);
        setMenus([]);
      }
    };

    if (!isOwner || (isOwner && selectedOutlet)) {
      fetchMenus();
    } else {
      setMenus([]); 
    }
  }, [isOwner, selectedOutlet, user]); 

  const handleGetForecast = async () => {
    if (isOwner && !selectedOutlet) {
      setForecastError('Owner harus memilih outlet terlebih dahulu.');
      toast.warn('Silakan pilih outlet terlebih dahulu.');
      return; 
    }

    if (!selectedProduct) {
      setForecastError('Silakan pilih produk terlebih dahulu.');
      toast.warn('Silakan pilih produk terlebih dahulu.');
      return; 
    }

    try {
      setForecastLoading(true);
      setForecastError('');
      setPredictionResult(null);

      const outletToForecast = isOwner ? selectedOutlet : undefined;
      
      const response = await getSalesForecast(selectedProduct, 7, outletToForecast);

      if (response && response.forecast && response.forecast.length > 0) {
        setPredictionResult(response);
      } else {
        setPredictionResult(null);
        const message =
          response?.message || 'Tidak cukup data historis untuk produk ini.';
        setForecastError(message);
        toast.info(message);
      }
    } catch (err) {
      setPredictionResult(null);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Terjadi kesalahan saat membuat prediksi.';
      setForecastError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setForecastLoading(false);
    }
  };

  const validationChartRef = useRef(null);
  const forecastChartRef = useRef(null);

  const downloadChartPNG = (chartRef, filename) => {
    if (!chartRef?.current) return;

    const chart = chartRef.current;
    const image = chart.toBase64Image();

    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    link.click();
  };

  const getDayName = (dateString) => {
    try {
      return new Date(dateString + 'T00:00:00Z').toLocaleDateString('id-ID', {
        weekday: 'long',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const forecastChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Prediksi Penjualan 7 Hari ke Depan',
        font: { size: 16 }
      },
      subtitle: {
        display: true,
        text: `Menu: ${selectedProduct} — Outlet: ${selectedOutletName}`,
        font: { size: 12 },
        padding: { bottom: 10 }
      },
      tooltip: {
        callbacks: {
          label: (context) => `Prediksi: ${Math.round(context.parsed.y)} unit`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        title: { display: true, text: 'Estimasi Jumlah Unit Terjual' },
      },
    },
  };

  const forecastChartData = useMemo(() => {
    const data = predictionResult?.forecast || [];
    return {
      labels: data.map((pred) => {
        try {
          return new Date(pred.ds + 'T00:00:00Z').toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });
        } catch (e) {
          return 'Invalid';
        }
      }),
      datasets: [
        {
          label: 'Prediksi Unit Terjual',
          data: data.map((pred) => Math.round(pred.yhat)),
          backgroundColor: 'rgba(40, 167, 69, 0.6)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [predictionResult]);

  const validationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Actual vs Forecast Plot (Data Historis)',
        font: { size: 16 }
      },
      subtitle: {
        display: true,
        text: `Menu: ${selectedProduct} — Outlet: ${selectedOutletName}`,
        font: { size: 12 },
        padding: { bottom: 10 }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Tanggal' } },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        title: { display: true, text: 'Jumlah Unit Terjual' },
      },
    },
  };

  const validationChartData = useMemo(() => {
    const data = predictionResult?.validation || [];
    return {
      labels: data.map((item) => {
        try {
          return new Date(item.ds + 'T00:00:00Z').toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          });
        } catch (e) {
          return 'Invalid';
        }
      }),
      datasets: [
        {
          label: 'Penjualan Aktual',
          data: data.map((item) => item.y),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Hasil Prediksi Model',
          data: data.map((item) => Math.round(item.yhat)),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
      ],
    };
  }, [predictionResult]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Prediksi Penjualan</h1>
        <p>
          Gunakan Machine Learning untuk mengestimasi penjualan produk di masa
          depan.
        </p>
      </div>

      <div className="forecast-panel card">
        <h3>Buat Prediksi Baru</h3>
        <p>
          Pilih {isOwner ? 'outlet dan' : ''} produk untuk melihat estimasi
          penjualan.
        </p>
        <div className="forecast-controls">
          
          {isOwner && (
            <select
              value={selectedOutlet}
              onChange={(e) => {
                setSelectedOutlet(e.target.value);
                setSelectedProduct(''); 
                setPredictionResult(null); 
                setForecastError('');
              }}
            >
              <option value="">Pilih Outlet...</option>
              {outlets.map((outlet) => (
                <option key={outlet.ID} value={outlet.ID}>
                  {outlet.Name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setPredictionResult(null);
              setForecastError('');
            }}
            disabled={
              (isOwner && !selectedOutlet) || 
              !Array.isArray(menus) ||
              menus.length === 0
            }
            className={!selectedProduct ? 'placeholder' : ''}
          >
            <option value="" disabled>
              {isOwner && !selectedOutlet
                ? 'Pilih outlet terlebih dahulu...'
                : 'Pilih menu di sini...'}
            </option>
            {Array.isArray(menus) &&
              menus.map((menu) => (
                <option key={menu.ID} value={menu.Name}>
                  {menu.Name}
                </option>
              ))}
          </select>

          <button
            onClick={handleGetForecast}
            disabled={
              forecastLoading ||
              !selectedProduct ||
              (isOwner && !selectedOutlet) 
            }
          >
            {forecastLoading ? 'Memproses...' : 'Buat Prediksi & Evaluasi'}
          </button>
        </div>

        {forecastError && <p className="error-message small">{forecastError}</p>}

        {predictionResult && !forecastLoading && (
          <>
            {predictionResult.metrics && (
              <div className="metrics-panel">
                <h4>
                  <FaCheckCircle /> Metrik Akurasi Model
                </h4>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-value">
                      {predictionResult.metrics.r2?.toFixed(3) ?? 'N/A'}
                    </span>
                    <span className="metric-label">R-squared (R²)</span>
                    <span className="metric-desc">
                      Seberapa baik model mengikuti data.
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">
                      {predictionResult.metrics.mae?.toFixed(2) ?? 'N/A'}
                    </span>
                    <span className="metric-label">MAE</span>
                    <span className="metric-desc">
                      Rata-rata kesalahan absolut.
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">
                      {predictionResult.metrics.rmse?.toFixed(2) ?? 'N/A'}
                    </span>
                    <span className="metric-label">RMSE</span>
                    <span className="metric-desc">
                      Akar rata-rata kuadrat error.
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-value">
                      {(predictionResult.metrics.mape * 100)?.toFixed(2) ??
                        'N/A'}
                      %
                    </span>
                    <span className="metric-label">MAPE</span>
                    <span className="metric-desc">
                      Rata-rata persentase error absolut.
                    </span>
                  </div>
                </div>
              </div>
            )}

          {predictionResult.validation &&
            predictionResult.validation.length > 0 && (
              <div className="validation-chart-container chart-card">
                <h4>
                  <FaChartLine /> Actual vs Forecast Plot (Data Historis)
                </h4>
                <p className="small text-muted">
                  Perbandingan penjualan aktual dan hasil prediksi model pada periode historis.
                </p>
                <div className="chart-wrapper">
                  <button
                    className="btn-download"
                    onClick={() =>
                      downloadChartPNG(
                        validationChartRef,
                        `actual_vs_forecast_${selectedProduct}.png`
                      )
                    }
                  >
                    Download PNG
                  </button>
                  <Line
                    ref={validationChartRef}
                    options={validationChartOptions}
                    data={validationChartData}
                  />
                </div>
              </div>
            )}

            {predictionResult.forecast &&
              predictionResult.forecast.length > 0 && (
                <div className="prediction-explanation chart-card">
                  <h4>
                    <FaInfoCircle /> Prediksi 7 Hari ke Depan untuk "
                    {selectedProduct}"
                  </h4>
                  <p className="explanation-summary">
                    Berikut estimasi penjualan di masa depan.
                  </p>

                  <div className="forecast-chart-container chart-wrapper">
                    <button
                      className="btn-download"
                      onClick={() =>
                        downloadChartPNG(
                          forecastChartRef,
                          `forecast_7hari_${selectedProduct}.png`
                        )
                      }
                    >
                      Download PNG
                    </button>
                    <Bar
                      ref={forecastChartRef}
                      options={forecastChartOptions}
                      data={forecastChartData}
                    />
                  </div>

                  <h5>Rincian Prediksi per Hari</h5>
                  <div className="daily-breakdown-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Prediksi (Unit)</th>
                          <th>Komponen Analisis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionResult.forecast.map((day) => (
                          <tr key={day.ds}>
                            <td>
                              <strong>{getDayName(day.ds)}</strong>
                              <br />
                              <small>
                                {new Date(
                                  day.ds + 'T00:00:00Z'
                                ).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </small>
                            </td>
                            <td className="prediction-value">
                              {Math.round(day.yhat)}
                            </td>
                            <td className="explanation-details">
                              <ul>
                                <li>
                                  <FaEquals className="icon trend" />
                                  <span>
                                    Tren Dasar:{' '}
                                    <strong>{(day.trend || 0).toFixed(1)}</strong>
                                  </span>
                                </li>
                                <li
                                  className={
                                    (day.weekly || 0) >= 0
                                      ? 'positive'
                                      : 'negative'
                                  }
                                >
                                  {(day.weekly || 0) >= 0 ? (
                                    <FaArrowUp className="icon positive" />
                                  ) : (
                                    <FaArrowDown className="icon negative" />
                                  )}
                                  <span>
                                    Efek Hari:{' '}
                                    <strong>
                                      {(day.weekly || 0) > 0 ? '+' : ''}
                                      {(day.weekly || 0).toFixed(1)}
                                    </strong>
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
                    <strong>Disclaimer:</strong> Ini adalah prediksi matematis
                    berdasarkan data historis dan bukan jaminan hasil di masa
                    depan.
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;