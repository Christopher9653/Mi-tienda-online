const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio uploads creado');
}

// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Middleware para manejar la subida
exports.uploadMiddleware = upload.single('imagen');

// Crear producto
exports.crear = (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, marca_id } = req.body;
  const imagen = req.file ? req.file.filename : null;

  // Validaciones básicas
  if (!nombre || !descripcion || !precio || !stock || !categoria_id || !marca_id) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const sql = 'INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, marca_id, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';
  pool.query(sql, [nombre, descripcion, precio, stock, categoria_id, marca_id, imagen], (err, result) => {
    if (err) {
      console.error('Error al crear producto:', err);
      return res.status(500).json({ error: 'Error al crear producto' });
    }
    res.status(201).json({ 
      mensaje: 'Producto creado exitosamente',
      id: result.insertId 
    });
  });
};

// Listar productos
exports.listar = (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS categoria_nombre, m.nombre AS marca_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN marcas m ON p.marca_id = m.id
    ORDER BY p.id DESC
  `;
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error al listar productos:', err);
      return res.status(500).json({ error: 'Error al listar productos' });
    }
    res.json(results);
  });
};

// Obtener producto por ID
exports.obtenerPorId = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, c.nombre AS categoria_nombre, m.nombre AS marca_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN marcas m ON p.marca_id = m.id
    WHERE p.id = ?
  `;
  
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener producto:', err);
      return res.status(500).json({ error: 'Error al obtener producto' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(results[0]);
  });
};

// Actualizar producto
exports.actualizar = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoria_id, marca_id } = req.body;
  const imagen = req.file ? req.file.filename : null;
  
  if (!nombre || !descripcion || !precio || !stock || !categoria_id || !marca_id) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  let sql, params;
  
  if (imagen) {
    // Si hay una nueva imagen
    sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria_id = ?, marca_id = ?, imagen = ? WHERE id = ?';
    params = [nombre, descripcion, precio, stock, categoria_id, marca_id, imagen, id];
  } else {
    // Si no hay nueva imagen, mantener la existente
    sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria_id = ?, marca_id = ? WHERE id = ?';
    params = [nombre, descripcion, precio, stock, categoria_id, marca_id, id];
  }
  
  pool.query(sql, params, (err) => {
    if (err) {
      console.error('Error al actualizar producto:', err);
      return res.status(500).json({ error: 'Error al actualizar producto' });
    }
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  });
};

// Eliminar producto
exports.eliminar = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  });
};
