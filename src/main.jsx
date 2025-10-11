// LOKASI: src/main.jsx (Versi Final & Benar)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './routes/App'; // <-- Menggunakan path Anda yang benar
import './index.css';

// --- TAMBAHAN UNTUK REACT MODAL (Sudah Ada) ---
import Modal from 'react-modal';

// --- TAMBAHAN BARU UNTUK REACT-TOASTIFY ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// --- AKHIR TAMBAHAN BARU ---

Modal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    
    {/* --- TAMBAHKAN KOMPONEN INI UNTUK MENAMPUNG NOTIFIKASI --- */}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    
  </React.StrictMode>,
);