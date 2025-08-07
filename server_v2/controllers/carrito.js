const { pool } = require('../config/db');

// ✅ Crear un carrito vacío para el usuario (opcional)
exports.crearCarrito = (req, res) => {
  const { usuario_id } = req.body;
  const sql = 'INSERT INTO carrito (usuario_id) VALUES (?)';
  pool.query(sql, [usuario_id], (err, result) => {
    if (err) {
      console.error('Error al crear carrito:', err);
      return res.status(500).json({ error: 'Error al crear carrito' });
    }
    res.status(201).json({ carrito_id: result.insertId });
  });
};

// ✅ Obtener los productos en el carrito del usuario
exports.obtenerCarrito = (req, res) => {
  const usuario_id = req.params.usuarioId;
  
  // Primero verificar si el usuario tiene un carrito
  pool.query('SELECT id FROM carrito WHERE usuario_id = ?', [usuario_id], (err, carritoResults) => {
    if (err) {
      console.error('Error al verificar carrito:', err);
      return res.status(500).json({ error: 'Error al verificar carrito' });
    }
    
    // Si no tiene carrito, devolver array vacío
    if (carritoResults.length === 0) {
      return res.json([]);
    }
    
    // Si tiene carrito, obtener los productos
    const sql = `
      SELECT c.id AS carrito_id, cd.id AS detalle_id, cd.producto_id, p.nombre, cd.cantidad, p.precio,
             (cd.cantidad * p.precio) AS subtotal, p.imagen
      FROM carrito c
      JOIN carrito_detalle cd ON c.id = cd.carrito_id
      JOIN productos p ON cd.producto_id = p.id
      WHERE c.usuario_id = ?
    `;
    pool.query(sql, [usuario_id], (err, results) => {
      if (err) {
        console.error('Error al obtener carrito:', err);
        return res.status(500).json({ error: 'Error al obtener carrito' });
      }
      res.json(results);
    });
  });
};

// ✅ Agregar un producto al carrito
exports.agregarProducto = (req, res) => {
  const { producto_id, cantidad, precio } = req.body;
  const usuario_id = req.usuario?.id || req.body.usuario_id;

  if (!producto_id || !cantidad) {
    return res.status(400).json({ error: 'Producto ID y cantidad son requeridos' });
  }

  pool.query('SELECT id FROM carrito WHERE usuario_id = ?', [usuario_id], (err, results) => {
    if (err) {
      console.error('Error al buscar carrito:', err);
      return res.status(500).json({ error: 'Error al buscar carrito' });
    }

    const carrito_id = results[0]?.id;

    if (!carrito_id) {
      pool.query('INSERT INTO carrito (usuario_id) VALUES (?)', [usuario_id], (err, result) => {
        if (err) {
          console.error('Error al crear carrito:', err);
          return res.status(500).json({ error: 'Error al crear carrito' });
        }
        insertarDetalle(result.insertId);
      });
    } else {
      insertarDetalle(carrito_id);
    }

    function insertarDetalle(carrito_id) {
      // Verificar si el producto ya existe en el carrito
      pool.query('SELECT id, cantidad FROM carrito_detalle WHERE carrito_id = ? AND producto_id = ?', 
        [carrito_id, producto_id], (err, results) => {
        if (err) {
          console.error('Error al verificar producto en carrito:', err);
          return res.status(500).json({ error: 'Error al verificar producto' });
        }

        if (results.length > 0) {
          // Actualizar cantidad si ya existe
          const nuevaCantidad = results[0].cantidad + cantidad;
          pool.query('UPDATE carrito_detalle SET cantidad = ? WHERE id = ?', 
            [nuevaCantidad, results[0].id], (err) => {
            if (err) {
              console.error('Error al actualizar cantidad:', err);
              return res.status(500).json({ error: 'Error al actualizar cantidad' });
            }
            res.json({ mensaje: 'Cantidad actualizada en el carrito' });
          });
        } else {
          // Insertar nuevo detalle
          const sql = `
            INSERT INTO carrito_detalle (carrito_id, producto_id, cantidad, precio)
            VALUES (?, ?, ?, ?)
          `;
          pool.query(sql, [carrito_id, producto_id, cantidad, precio], (err) => {
            if (err) {
              console.error('Error al agregar producto:', err);
              return res.status(500).json({ error: 'Error al agregar producto' });
            }
            res.json({ mensaje: 'Producto agregado al carrito' });
          });
        }
      });
    }
  });
};

// ✅ Actualizar la cantidad de un producto en el carrito
exports.actualizarCantidad = (req, res) => {
  const { detalle_id, cantidad } = req.body;
  
  if (!detalle_id || !cantidad || cantidad < 1) {
    return res.status(400).json({ error: 'ID de detalle y cantidad válida son requeridos' });
  }

  const sql = 'UPDATE carrito_detalle SET cantidad = ? WHERE id = ?';
  pool.query(sql, [cantidad, detalle_id], (err) => {
    if (err) {
      console.error('Error al actualizar cantidad:', err);
      return res.status(500).json({ error: 'Error al actualizar cantidad' });
    }
    res.json({ mensaje: 'Cantidad actualizada' });
  });
};

// ✅ Eliminar un producto del carrito
exports.eliminarProducto = (req, res) => {
  const { detalleId } = req.params;
  const sql = 'DELETE FROM carrito_detalle WHERE id = ?';
  pool.query(sql, [detalleId], (err) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ error: 'Error al eliminar producto' });
    }
    res.json({ mensaje: 'Producto eliminado del carrito' });
  });
};

// ✅ Vaciar el carrito completo
exports.vaciarCarrito = (req, res) => {
  const { carritoId } = req.params;
  const sql = 'DELETE FROM carrito_detalle WHERE carrito_id = ?';
  pool.query(sql, [carritoId], (err) => {
    if (err) {
      console.error('Error al vaciar carrito:', err);
      return res.status(500).json({ error: 'Error al vaciar carrito' });
    }
    res.json({ mensaje: 'Carrito vaciado' });
  });
};
