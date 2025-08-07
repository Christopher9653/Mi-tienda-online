// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';


import {
  Navbar,
  Home,
  Login,
  Register,
  ForgotPassword,
  Productos,
  Carts,
  Perfil,
  Facturas,
  Estadisticas,
  AdminPanel,
  PrivateRoute,
  GestionProductos,
  GestionCategorias,
  GestionMarcas,
  GestionFacturas
} from './components';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rutas protegidas */}
        <Route path="/productos" element={
          <PrivateRoute roles={['admin', 'usuario']}>
            <Productos />
          </PrivateRoute>
        } />
        <Route path="/carrito" element={
          <PrivateRoute roles={['admin', 'usuario']}>
            <Carts />
          </PrivateRoute>
        } />
        <Route path="/perfil" element={
          <PrivateRoute roles={['admin', 'usuario']}>
            <Perfil />
          </PrivateRoute>
        } />
        <Route path="/facturas" element={
          <PrivateRoute roles={['admin', 'usuario']}>
            <Facturas />
          </PrivateRoute>
        } />
        <Route path="/estadisticas" element={
          <PrivateRoute roles={['admin', 'usuario']}>
            <Estadisticas />
          </PrivateRoute>
        } />

        {/* Solo admin */}
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminPanel />
          </PrivateRoute>
        } />
        <Route path="/admin/gestion-productos" element={
          <PrivateRoute roles={['admin']}>
           <GestionProductos />
          </PrivateRoute>
        } />
        <Route path="/admin/gestion-categorias" element={
          <PrivateRoute roles={['admin']}>
           <GestionCategorias />
          </PrivateRoute>
        } />
        <Route path="/admin/gestion-marcas" element={
          <PrivateRoute roles={['admin']}>
           <GestionMarcas />
          </PrivateRoute>
        } />
        <Route path="/admin/gestion-facturas" element={
          <PrivateRoute roles={['admin']}>
           <GestionFacturas />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}


export default App;
