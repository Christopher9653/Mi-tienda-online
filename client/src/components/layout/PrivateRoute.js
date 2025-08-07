// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ Importación correcta

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token); // ✅ Uso correcto de la función

    if (!roles.includes(decoded.rol)) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;
