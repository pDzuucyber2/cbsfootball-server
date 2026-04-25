import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const storedRole = localStorage.getItem('role');

  if (storedRole === 'admin') {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default AdminRoute;