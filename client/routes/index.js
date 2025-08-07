// client/src/routes/index.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  Login,
  Register,
  Productos,
  Carts,
  Perfil,
  Facturas,
  Estadisticas,
  AdminPanel
} from '../components';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/carrito" element={<Carts />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/facturas" element={<Facturas />} />
      <Route path="/estadisticas" element={<Estadisticas />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
};

export default AppRoutes;
