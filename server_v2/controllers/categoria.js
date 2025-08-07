const { pool } = require('../config/db');

// Obtener todas las categorías
exports.obtenerCategorias = (req, res) => {
  const sql = 'SELECT * FROM categorias ORDER BY nombre';
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
    res.json(results);
  });
};

// Crear nueva categoría
exports.crearCategoria = (req, res) => {
  const { nombre } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
  }

  const sql = 'INSERT INTO categorias (nombre) VALUES (?)';
  pool.query(sql, [nombre], (err, result) => {
    if (err) {
      console.error('Error al crear categoría:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La categoría ya existe' });
      }
      return res.status(500).json({ error: 'Error al crear categoría' });
    }
    res.status(201).json({ 
      mensaje: 'Categoría creada exitosamente',
      id: result.insertId 
    });
  });
};

// Actualizar categoría
exports.actualizarCategoria = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
  }

  const sql = 'UPDATE categorias SET nombre = ? WHERE id = ?';
  pool.query(sql, [nombre, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar categoría:', err);
      return res.status(500).json({ error: 'Error al actualizar categoría' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({ mensaje: 'Categoría actualizada exitosamente' });
  });
};

// Eliminar categoría
exports.eliminarCategoria = (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM categorias WHERE id = ?';
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar categoría:', err);
      return res.status(500).json({ error: 'Error al eliminar categoría' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json({ mensaje: 'Categoría eliminada exitosamente' });
  });
}; 