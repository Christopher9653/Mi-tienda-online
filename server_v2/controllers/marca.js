const { pool } = require('../config/db');

// Obtener todas las marcas
exports.obtenerMarcas = (req, res) => {
  const sql = 'SELECT * FROM marcas ORDER BY nombre';
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener marcas:', err);
      return res.status(500).json({ error: 'Error al obtener marcas' });
    }
    res.json(results);
  });
};

// Crear nueva marca
exports.crearMarca = (req, res) => {
  const { nombre } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la marca es requerido' });
  }

  const sql = 'INSERT INTO marcas (nombre) VALUES (?)';
  pool.query(sql, [nombre], (err, result) => {
    if (err) {
      console.error('Error al crear marca:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La marca ya existe' });
      }
      return res.status(500).json({ error: 'Error al crear marca' });
    }
    res.status(201).json({ 
      mensaje: 'Marca creada exitosamente',
      id: result.insertId 
    });
  });
};

// Actualizar marca
exports.actualizarMarca = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la marca es requerido' });
  }

  const sql = 'UPDATE marcas SET nombre = ? WHERE id = ?';
  pool.query(sql, [nombre, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar marca:', err);
      return res.status(500).json({ error: 'Error al actualizar marca' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    
    res.json({ mensaje: 'Marca actualizada exitosamente' });
  });
};

// Eliminar marca
exports.eliminarMarca = (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM marcas WHERE id = ?';
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar marca:', err);
      return res.status(500).json({ error: 'Error al eliminar marca' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    
    res.json({ mensaje: 'Marca eliminada exitosamente' });
  });
}; 