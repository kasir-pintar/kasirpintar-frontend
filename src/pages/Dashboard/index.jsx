// LOKASI: src/pages/Dashboard/index.jsx

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

// --- PERBAIKAN: Impor semua jenis dashboard ---
import OwnerDashboardPage from './OwnerDashboard';
import ManagerDashboardPage from './ManagerDashboard';

function DashboardIndexPage() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Token tidak valid:", error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ padding: '30px' }}>Memuat...</div>;
  }

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  // --- PERBAIKAN UTAMA: Logika Switch Diperbarui ---
  switch (userRole) {
    // Admin dan Owner melihat dashboard yang sama (dengan filter)
    case 'admin':
    case 'owner':
      return <OwnerDashboardPage />;
    
    // Branch Manager melihat dashboard sederhana miliknya
    case 'branch_manager':
      return <ManagerDashboardPage />;

    // Kasir tidak punya dashboard, arahkan ke halaman kasir
    case 'cashier':
      return <Navigate to="/cashier" />;

    default:
      // Untuk peran lain yang tidak terduga, kembalikan ke login
      return <Navigate to="/login" />;
  }
}

export default DashboardIndexPage;