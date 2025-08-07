const express = require('express');
const cors = require('cors');
const app = express();
const { pool } = require('./config/db'); // conexión a MySQL
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos MySQL');
    connection.release(); // Liberar la conexión
  }
});

// Rutas
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/productos', require('./routes/producto'));
app.use('/api/carrito', require('./routes/carrito'));
app.use('/api/facturas', require('./routes/factura'));
app.use('/api/categorias', require('./routes/categoria'));
app.use('/api/marcas', require('./routes/marca'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Puerto del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
});
