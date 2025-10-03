// LOKASI: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './routes/App';
import './index.css';     // <-- Perbaikan 2: Path ke index.css

// --- TAMBAHAN UNTUK REACT MODAL ---
import Modal from 'react-modal';
Modal.setAppElement('#root');
// ------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);