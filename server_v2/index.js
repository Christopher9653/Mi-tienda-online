const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg'); // Importa Pool desde pg
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Render con SSL
  }
});

// Prueba de conexión inicial (corregido)
pool.connect((err, client, done) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos PostgreSQL');
    done(); // Libera el cliente de vuelta al pool
  }
});

// Resto de tu código...
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas, puerto, etc.
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/productos', require('./routes/producto'));
app.use('/api/carrito', require('./routes/carrito'));
app.use('/api/facturas', require('./routes/factura'));
app.use('/api/categorias', require('./routes/categoria'));
app.use('/api/marcas', require('./routes/marca'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
});
