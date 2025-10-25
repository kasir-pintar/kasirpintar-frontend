import React, { useState, useEffect, useMemo } from 'react';
// --- Pastikan path service benar ---
import { getAllMenus } from '../../services/menu';
import { getSalesForecast } from '../../services/forecast';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './AnalyticsPage.scss';
import { FaInfoCircle, FaArrowUp, FaArrowDown, FaEquals, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Import toast

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function AnalyticsPage() {
    const [menus, setMenus] = useState([]); // Inisialisasi sudah benar []
    const [selectedProduct, setSelectedProduct] = useState('');
    const [forecastLoading, setForecastLoading] = useState(false);
    const [forecastError, setForecastError] = useState('');
    const [predictionResult, setPredictionResult] = useState(null);

    // --- useEffect UNTUK FETCH MENUS DIPERBAIKI ---
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                // Panggil service, response = { data: [...] }
                const response = await getAllMenus();

                // --- PERBAIKAN DI SINI ---
                // Akses array di dalam properti 'data'
                setMenus(response.data || []);
                // --- AKHIR PERBAIKAN ---

            } catch (err) {
                console.error("Gagal memuat daftar menu:", err);
                // Tampilkan error ke user jika perlu
                toast.error("Gagal memuat daftar menu.");
                setMenus([]); // Pastikan tetap array jika error
            }
        };
        fetchMenus();
    }, []); // Hanya dijalankan sekali saat komponen mount

    const handleGetForecast = async () => {
        if (!selectedProduct) {
            setForecastError("Silakan pilih produk terlebih dahulu.");
            toast.warn("Silakan pilih produk terlebih dahulu."); // Gunakan toast
            return;
        }
        try {
            setForecastLoading(true);
            setForecastError('');
            setPredictionResult(null);

            const response = await getSalesForecast(selectedProduct, 7); // Asumsi service mengembalikan data langsung

            // Periksa apakah ada forecast dalam response
            if (response && response.forecast && response.forecast.length > 0) {
                 setPredictionResult(response);
            } else {
                 setPredictionResult(null);
                 // Tampilkan pesan yang lebih informatif jika ada dari backend
                 const message = response?.message || "Tidak cukup data historis untuk produk ini atau terjadi kesalahan.";
                 setForecastError(message);
                 toast.info(message); // Gunakan toast info
            }
        } catch (err) {
            setPredictionResult(null);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Terjadi kesalahan saat membuat prediksi.";
            setForecastError(errorMessage);
            toast.error(errorMessage); // Tampilkan error ke user
        } finally {
            setForecastLoading(false);
        }
    };


    const getDayName = (dateString) => {
        // Handle invalid date string gracefully
        try {
            // Tambahkan T00:00:00Z untuk memastikan interpretasi UTC dan hindari masalah timezone
            return new Date(dateString + 'T00:00:00Z').toLocaleDateString('id-ID', { weekday: 'long' });
        } catch (e) {
            return "Invalid Date";
        }
    };

    // Opsi Grafik untuk Prediksi Masa Depan (Bar Chart)
    const forecastChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Biarkan chart menyesuaikan tinggi container
        plugins: {
            legend: { display: false },
            title: { display: true, text: `Prediksi Penjualan (Unit) untuk ${selectedProduct}` },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            // Bulatkan hasil prediksi ke integer terdekat
                            label += Math.round(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    // Hanya tampilkan angka bulat di sumbu Y
                    precision: 0,
                    stepSize: 1
                 },
                title: { display: true, text: 'Estimasi Jumlah Unit Terjual' }
            }
        }
    };


    const forecastChartData = useMemo(() => {
        const data = predictionResult?.forecast || [];
        return {
            labels: data.map(pred => {
                 try {
                     // Tambahkan T00:00:00Z
                     return new Date(pred.ds + 'T00:00:00Z').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
                 } catch(e) { return 'Invalid'; }
            }),
            datasets: [{
                label: 'Prediksi Unit Terjual',
                // Bulatkan nilai prediksi untuk grafik bar
                data: data.map(pred => Math.round(pred.yhat)),
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
            }],
        };
    }, [predictionResult]);

    // Opsi dan Data untuk Grafik Validasi (Line Chart)
    const validationChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Performa Model: Penjualan Aktual vs. Hasil Prediksi (Data Historis)' },
        },
        scales: {
             x: {
                 title: { display: true, text: 'Tanggal'}
             },
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }, // Hanya angka bulat di sumbu Y
                title: { display: true, text: 'Jumlah Unit Terjual' }
            }
        }
    };

    const validationChartData = useMemo(() => {
        const data = predictionResult?.validation || [];
        return {
            labels: data.map(item => {
                 try {
                     // Tambahkan T00:00:00Z
                     return new Date(item.ds + 'T00:00:00Z').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                 } catch(e) { return 'Invalid'; }
            }),
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
                    // Bulatkan juga hasil prediksi historis
                    data: data.map(item => Math.round(item.yhat)),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.1
                }
            ],
        };
    }, [predictionResult]);

    // --- RENDER JSX ---
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
                            setPredictionResult(null); // Reset hasil saat produk diganti
                            setForecastError('');     // Reset error saat produk diganti
                        }}
                        disabled={!Array.isArray(menus) || menus.length === 0} // Nonaktifkan jika menu belum load/kosong
                        className={!selectedProduct ? 'placeholder' : ''}
                    >
                        <option value="" disabled>Pilih menu di sini...</option>
                        {/* Sekarang menus.map() akan bekerja */}
                        {Array.isArray(menus) && menus.map(menu => <option key={menu.ID} value={menu.Name}>{menu.Name}</option>)}
                    </select>
                    <button onClick={handleGetForecast} disabled={forecastLoading || !selectedProduct}>
                        {forecastLoading ? 'Memproses...' : 'Buat Prediksi & Evaluasi'}
                    </button>
                </div>

                {forecastError && <p className="error-message small">{forecastError}</p>}

                {/* Tampilkan Hasil hanya jika ada predictionResult dan tidak sedang loading */}
                {predictionResult && !forecastLoading && (
                    <>
                        {/* Panel Metrik */}
                        {predictionResult.metrics && (
                            <div className="metrics-panel">
                                <h4><FaCheckCircle /> Metrik Akurasi Model</h4>
                                <div className="metrics-grid">
                                    <div className="metric-item">
                                        <span className="metric-value">{predictionResult.metrics.r2?.toFixed(3) ?? 'N/A'}</span>
                                        <span className="metric-label">R-squared (R²)</span>
                                        <span className="metric-desc">Seberapa baik model mengikuti data (mendekati 1 lebih baik).</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-value">{predictionResult.metrics.mae?.toFixed(2) ?? 'N/A'}</span>
                                        <span className="metric-label">MAE</span>
                                        <span className="metric-desc">Rata-rata kesalahan absolut (prediksi meleset ~{predictionResult.metrics.mae?.toFixed(2) ?? '?'} unit).</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-value">{predictionResult.metrics.rmse?.toFixed(2) ?? 'N/A'}</span>
                                        <span className="metric-label">RMSE</span>
                                        <span className="metric-desc">Akar rata-rata kuadrat error (mirip MAE, lebih menghukum error besar).</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-value">{(predictionResult.metrics.mape * 100)?.toFixed(2) ?? 'N/A'}%</span>
                                        <span className="metric-label">MAPE</span>
                                        <span className="metric-desc">Rata-rata persentase error absolut.</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grafik Validasi */}
                        {predictionResult.validation && predictionResult.validation.length > 0 && (
                            <div className="validation-chart-container chart-card">
                                <h4><FaChartLine /> Visualisasi Kinerja Model (Data Historis)</h4>
                                <div className='chart-wrapper'>
                                     <Line options={validationChartOptions} data={validationChartData} />
                                </div>
                            </div>
                        )}

                        {/* Penjelasan dan Grafik Prediksi */}
                        {predictionResult.forecast && predictionResult.forecast.length > 0 && (
                             <div className="prediction-explanation chart-card">
                                <h4><FaInfoCircle /> Prediksi 7 Hari ke Depan untuk "{selectedProduct}"</h4>
                                <p className="explanation-summary">
                                    Berdasarkan model yang dievaluasi, berikut estimasi penjualan di masa depan.
                                </p>

                                <div className="forecast-chart-container chart-wrapper">
                                    <Bar options={forecastChartOptions} data={forecastChartData} />
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
                                            {predictionResult.forecast.map(day => (
                                                <tr key={day.ds}>
                                                    <td>
                                                        <strong>{getDayName(day.ds)}</strong><br />
                                                        <small>{ new Date(day.ds + 'T00:00:00Z').toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</small>
                                                    </td>
                                                    <td className="prediction-value">
                                                        {Math.round(day.yhat)} {/* Bulatkan prediksi */}
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
                                                            {/* Anda bisa menambahkan komponen lain jika ada (misal: efek libur) */}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="disclaimer">
                                    <strong>Disclaimer:</strong> Ini adalah prediksi matematis berdasarkan data historis dan bukan jaminan hasil di masa depan.
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