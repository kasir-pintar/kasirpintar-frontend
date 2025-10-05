// LOKASI: src/pages/Dashboard/index.jsx
import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboard';
import ManagerDashboardPage from './ManagerDashboard';

function DashboardIndexPage() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const userRole = jwtDecode(token).role;

    if (userRole === 'admin') {
      return <AdminDashboardPage />;
    }
    if (userRole === 'manager') {
      return <ManagerDashboardPage />;
    }
    
    // Jika ada peran lain yang tidak sengaja masuk, arahkan ke kasir
    return <Navigate to="/cashier" />;

  } catch (error) {
    // Jika token tidak valid, arahkan ke login
    return <Navigate to="/login" />;
  }
}

export default DashboardIndexPage;