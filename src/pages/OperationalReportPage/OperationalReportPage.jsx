// LOKASI: src/pages/OperationalReportPage/OperationalReportPage.jsx
import React, { useState, useMemo, useEffect } from 'react'; // Tambahkan useEffect
import { getBasketAnalysis, getBusyHours, getCustomerSegmentation } from '../../services/analytics';
import { getAllOutlets } from '../../services/outlet'; // <-- TAMBAHKAN
import { toast } from 'react-toastify'; // <-- TAMBAHKAN
import './OperationalReportPage.scss';
import { FaShoppingCart, FaClock, FaUsers, FaCrown, FaStar, FaHeart, FaUserPlus, FaUserClock, FaUserSlash } from 'react-icons/fa';

// --- 🔹 FUNGSI PENTING UNTUK DECODE TOKEN 🔹 ---
// (Sama seperti di AnalyticsPage)
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
// --- 🔹 AKHIR FUNGSI 🔹 ---


// Komponen Heatmap (tidak berubah)
const BusyHoursHeatmap = ({ data }) => {
  // ... (Tidak ada perubahan di dalam komponen ini) ...
  const hours = Array.from({ length: 15 }, (_, i) => i + 9); 
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const { grid, maxCount } = useMemo(() => {
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    let maxCount = 0;
    if (data) {
      data.forEach(item => {
        const dayIndex = item.day_of_week - 1;
        grid[dayIndex][item.hour] = item.count;
        if (item.count > maxCount) {
          maxCount = item.count;
        }
      });
    }
    return { grid, maxCount };
  }, [data]);

  const getCellColor = (count) => {
    if (count === 0) return '#eff3f7';
    const intensity = count / maxCount;
    const hue = 120 * (1 - intensity);
    return `hsl(${hue}, 100%, 80%)`;
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-legend">
        <span>Sepi</span>
        <div className="gradient-bar"></div>
        <span>Ramai</span>
      </div>
      <div className="heatmap-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Hari</th>
              {hours.map(hour => <th key={hour}>{String(hour).padStart(2, '0')}:00</th>)}
            </tr>
          </thead>
          <tbody>
            {days.map((dayName, dayIndex) => (
              <tr key={dayName}>
                <td>{dayName}</td>
                {hours.map(hour => {
                  const count = grid[dayIndex][hour] || 0;
                  return (
                    <td 
                      key={`${dayName}-${hour}`} 
                      style={{ backgroundColor: getCellColor(count) }}
                      title={`${count} transaksi`}
                    >
                      {count > 0 ? count : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function OperationalReportPage() {
  // --- 🔹 PERBAIKAN: State untuk User & Outlets 🔹 ---
  const [user, setUser] = useState(getTokenData());
  const isOwner = user?.role === 'owner';
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  // --- 🔹 AKHIR PERBAIKAN 🔹 ---

  const [basketData, setBasketData] = useState(null);
  const [basketLoading, setBasketLoading] = useState(false);
  const [basketError, setBasketError] = useState('');
  
  const [busyHoursData, setBusyHoursData] = useState(null);
  const [busyHoursLoading, setBusyHoursLoading] = useState(false);
  const [busyHoursError, setBusyHoursError] = useState('');

  const [customerData, setCustomerData] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [activeSegment, setActiveSegment] = useState(null);

  // --- 🔹 PERBAIKAN: useEffect untuk Fetch Outlets 🔹 ---
  useEffect(() => {
    if (!isOwner) return; // Hanya jalankan jika owner
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
  // --- 🔹 AKHIR PERBAIKAN 🔹 ---

  // --- 🔹 PERBAIKAN: Modifikasi handleGetBasketAnalysis 🔹 ---
  const handleGetBasketAnalysis = async () => {
    // 1. Validasi Owner
    if (isOwner && !selectedOutlet) {
      const msg = "Owner harus memilih outlet terlebih dahulu.";
      setBasketError(msg);
      toast.warn(msg);
      return;
    }
    
    try {
      setBasketLoading(true);
      setBasketError('');
      setBasketData(null);
      // 2. Kirim outlet ID (jika ada)
      const outletToAnalyze = isOwner ? selectedOutlet : undefined;
      const analysisResult = await getBasketAnalysis(outletToAnalyze);
      setBasketData(analysisResult);
    } catch (err) {
      // 3. Tampilkan error yang lebih baik
      const errMsg = err.response?.data?.error || err.toString();
      setBasketError(errMsg);
    } finally {
      setBasketLoading(false);
    }
  };
  
  // --- 🔹 PERBAIKAN: Modifikasi handleGetBusyHours 🔹 ---
  const handleGetBusyHours = async () => {
    // 1. Validasi Owner
    if (isOwner && !selectedOutlet) {
      const msg = "Owner harus memilih outlet terlebih dahulu.";
      setBusyHoursError(msg);
      toast.warn(msg);
      return;
    }

    try {
      setBusyHoursLoading(true);
      setBusyHoursError('');
      setBusyHoursData(null);
      // 2. Kirim outlet ID (jika ada)
      const outletToAnalyze = isOwner ? selectedOutlet : undefined;
      const analysisResult = await getBusyHours(outletToAnalyze);
      setBusyHoursData(analysisResult);
    } catch (err) {
      // 3. Tampilkan error yang lebih baik
      const errMsg = err.response?.data?.error || err.toString();
      setBusyHoursError(errMsg);
    } finally {
      setBusyHoursLoading(false);
    }
  };

  // --- 🔹 PERBAIKAN: Modifikasi handleGetCustomerSegmentation 🔹 ---
  const handleGetCustomerSegmentation = async () => {
    // 1. Validasi Owner
    if (isOwner && !selectedOutlet) {
      const msg = "Owner harus memilih outlet terlebih dahulu.";
      setCustomerError(msg);
      toast.warn(msg);
      return;
    }

    try {
      setCustomerLoading(true);
      setCustomerError('');
      setCustomerData(null);
      setActiveSegment(null);
      // 2. Kirim outlet ID (jika ada)
      const outletToAnalyze = isOwner ? selectedOutlet : undefined;
      const analysisResult = await getCustomerSegmentation(outletToAnalyze);
      setCustomerData(analysisResult);
    } catch (err) {
      // 3. Tampilkan error yang lebih baik
      const errMsg = err.response?.data?.error || err.toString();
      setCustomerError(errMsg);
    } finally {
      setCustomerLoading(false);
    }
  };
  // --- 🔹 AKHIR SEMUA PERBAIKAN 🔹 ---

  // ... (Sisa kode (useMemo, segmentInfo, dll) tidak berubah) ...
  const customerSegments = useMemo(() => {
    if (!customerData) return {};
    return customerData.reduce((acc, customer) => {
      const segment = customer.segment;
      if (!acc[segment]) {
        acc[segment] = [];
      }
      acc[segment].push(customer);
      return acc;
    }, {});
  }, [customerData]);

  const segmentInfo = {
    "Pelanggan Juara": { icon: <FaCrown />, color: "#ffc107", desc: "Baru saja beli, sering beli, dan total belanja besar. Pelanggan terbaik Anda." },
    "Pelanggan Setia": { icon: <FaStar />, color: "#007bff", desc: "Sering beli, tapi mungkin total belanjanya standar. Tulang punggung bisnis." },
    "Pelanggan Potensial": { icon: <FaHeart />, color: "#28a745", desc: "Baru saja beli, namun belum terlalu sering. Berpotensi menjadi Pelanggan Setia." },
    "Pelanggan Baru": { icon: <FaUserPlus />, color: "#17a2b8", desc: "Hanya pernah melakukan satu kali transaksi. Perlu didorong untuk kembali." },
    "Pelanggan Berisiko": { icon: <FaUserClock />, color: "#fd7e14", desc: "Dulu sering beli, tapi sudah lama tidak kembali. Perlu diaktifkan kembali." },
    "Pelanggan Tidur": { icon: <FaUserSlash />, color: "#dc3545", desc: "Sudah sangat lama tidak kembali. Paling sulit untuk diaktifkan kembali." },
  };

  const segmentOrder = ["Pelanggan Juara", "Pelanggan Setia", "Pelanggan Potensial", "Pelanggan Baru", "Pelanggan Berisiko", "Pelanggan Tidur"];
  
  return (
    <div className="operational-report-container">
      <div className="operational-report-header">
        <h1>Laporan Operasional</h1>
        <p>Analisis data historis untuk menemukan pola dan wawasan operasional.</p>
      </div>

      {/* --- 🔹 PERBAIKAN: Tambahkan Panel Filter Outlet untuk Owner 🔹 --- */}
      {isOwner && (
        <div className="filter-panel card">
          <h4>Filter Laporan</h4>
          <p>Sebagai Owner, Anda harus memilih outlet untuk melihat laporan.</p>
          <select
            value={selectedOutlet}
            onChange={(e) => {
              const newOutletId = e.target.value;
              setSelectedOutlet(newOutletId);
              // Reset semua data & error saat ganti outlet
              setBasketData(null); 
              setBasketError('');
              setBusyHoursData(null); 
              setBusyHoursError('');
              setCustomerData(null); 
              setCustomerError('');
              setActiveSegment(null);
            }}
          >
            <option value="">Pilih Outlet...</option>
            {outlets.map((outlet) => (
              <option key={outlet.ID} value={outlet.ID}>
                {outlet.Name}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* --- 🔹 AKHIR PERBAIKAN 🔹 --- */}


      <div className="basket-analysis-panel card">
        <h3><FaShoppingCart /> Analitik Keranjang Belanja</h3>
        <p>Temukan pasangan produk yang paling sering dibeli bersama oleh pelanggan untuk membuat strategi bundling atau promosi.</p>
        <div className="analysis-controls">
          {/* --- 🔹 PERBAIKAN: Modifikasi Tombol Disabled 🔹 --- */}
          <button 
            onClick={handleGetBasketAnalysis} 
            disabled={basketLoading || (isOwner && !selectedOutlet)}
          >
            {basketLoading ? 'Menganalisis...' : 'Jalankan Analisis'}
          </button>
        </div>
        
        {/* Tampilkan pesan jika owner belum pilih */}
        {isOwner && !selectedOutlet && !basketError && (
          <p className="info-message small">Pilih outlet di atas untuk menjalankan analisis.</p>
        )}
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

      <div className="busy-hours-panel card">
        <h3><FaClock /> Analitik Waktu Sibuk</h3>
        <p>Visualisasikan jam dan hari paling ramai transaksi untuk membantu optimisasi jadwal staf dan merancang strategi promosi.</p>
        <div className="analysis-controls">
          {/* --- 🔹 PERBAIKAN: Modifikasi Tombol Disabled 🔹 --- */}
          <button 
            onClick={handleGetBusyHours} 
            disabled={busyHoursLoading || (isOwner && !selectedOutlet)}
          >
            {busyHoursLoading ? 'Menganalisis...' : 'Jalankan Analisis Waktu Sibuk'}
          </button>
        </div>
        
        {/* Tampilkan pesan jika owner belum pilih */}
        {isOwner && !selectedOutlet && !busyHoursError && (
          <p className="info-message small">Pilih outlet di atas untuk menjalankan analisis.</p>
        )}
        {busyHoursError && <p className="error-message small">{busyHoursError}</p>}

        {busyHoursData && (
          <div className="analysis-result">
            {busyHoursData.length > 0 ? (
              <BusyHoursHeatmap data={busyHoursData} />
            ) : (
              <p className="no-data">Tidak ada data transaksi untuk dianalisis.</p>
            )}
          </div>
        )}
      </div>

      <div className="customer-segmentation-panel card">
        <h3><FaUsers /> Analitik Pelanggan (Segmentasi RFM)</h3>
        <p>Kelompokkan pelanggan Anda ke dalam segmen-segmen berharga untuk strategi marketing yang lebih cerdas dan bertarget.</p>
        <div className="analysis-controls">
          {/* --- 🔹 PERBAIKAN: Modifikasi Tombol Disabled 🔹 --- */}
          <button 
            onClick={handleGetCustomerSegmentation} 
            disabled={customerLoading || (isOwner && !selectedOutlet)}
          >
            {customerLoading ? 'Menganalisis...' : 'Jalankan Segmentasi Pelanggan'}
          </button>
        </div>
        
        {/* Tampilkan pesan jika owner belum pilih */}
        {isOwner && !selectedOutlet && !customerError && (
          <p className="info-message small">Pilih outlet di atas untuk menjalankan analisis.</p>
        )}
        {customerError && <p className="error-message small">{customerError}</p>}

        {customerData && (
          <div className="analysis-result">
            {customerData.length > 0 ? (
              <>
                <h5>Segmen Pelanggan</h5>
                <div className="segment-summary">
                  {segmentOrder.map(segmentName => {
                    const segment = segmentInfo[segmentName];
                    const count = customerSegments[segmentName]?.length || 0;
                    if (count === 0) return null; // Sembunyikan jika segmen kosong
                    return (
                      <div 
                        key={segmentName} 
                        className={`segment-card ${activeSegment === segmentName ? 'active' : ''}`}
                        style={{'--segment-color': segment.color}}
                        onClick={() => setActiveSegment(activeSegment === segmentName ? null : segmentName)}
                      >
                        <div className="segment-card-header">
                          <span className="segment-icon">{segment.icon}</span>
                          <span className="segment-name">{segmentName}</span>
                          <span className="segment-count">{count}</span>
                        </div>
                        <p className="segment-desc">{segment.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {activeSegment && customerSegments[activeSegment] && (
                  <div className="segment-detail-list">
                    <h4>Daftar Pelanggan: {activeSegment} ({customerSegments[activeSegment].length})</h4>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Nama</th>
                            <th>No. Telepon</th>
                            <th>Pembelian Terakhir</th>
                            <th>Frekuensi</th>
                            <th>Total Belanja (Monetary)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerSegments[activeSegment].map(customer => (
                            <tr key={customer.customer_id}>
                              <td>{customer.name}</td>
                              <td>{customer.phone_number}</td>
                              <td>{new Date(customer.last_purchase).toLocaleDateString('id-ID')}</td>
                              <td>{customer.frequency}x</td>
                              <td>Rp {customer.monetary.toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">Tidak ditemukan data pelanggan untuk disegmentasi.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default OperationalReportPage;