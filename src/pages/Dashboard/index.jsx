// LOKASI: src/pages/Dashboard/index.jsx

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboard';
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
        console.error("Invalid token:", error);
        // If the token is invalid, the role will remain null
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ padding: '30px' }}>Loading...</div>;
  }

  if (!userRole) {
    // Redirect to login if no token or token is invalid
    return <Navigate to="/login" />;
  }

  // **UPDATED LOGIC HERE**
  switch (userRole) {
    case 'admin':
      return <AdminDashboardPage />;
    
    // Both 'owner' and 'branch_manager' will see the same dashboard
    case 'owner':
    case 'branch_manager':
      return <ManagerDashboardPage />;

    // Redirect other roles (like 'cashier') to their default page
    case 'cashier':
      return <Navigate to="/cashier" />;

    default:
      // Fallback for any other unexpected roles
      return <Navigate to="/login" />;
  }
}

export default DashboardIndexPage;