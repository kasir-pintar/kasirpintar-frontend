// LOKASI: src/pages/Landing/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.scss'; // <-- Import file SCSS

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="landing-title">Selamat Datang di KasirPintar</h1>
      <p className="landing-subtitle">Solusi Point-of-Sale cerdas untuk bisnis Anda.</p>
      <button 
        onClick={() => navigate('/login')} 
        className="landing-button"
      >
        Masuk ke Aplikasi
      </button>
    </div>
  );
}

export default LandingPage;