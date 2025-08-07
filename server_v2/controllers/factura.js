const { pool } = require('../config/db');

// Crear factura (a partir del carrito del usuario)
exports.crearFactura = (req, res) => {
  const { usuario_id, productos } = req.body;

  // Calcular total de la factura
  const total = productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);

  const insertFactura = 'INSERT INTO facturas (usuario_id, total) VALUES (?, ?)';
  pool.query(insertFactura, [usuario_id, total], (err, result) => {
    if (err) {
      console.error('Error al crear factura:', err);
      return res.status(500).json({ error: 'Error al crear factura' });
    }

    const factura_id = result.insertId;
    const insertDetalle = 'INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio) VALUES ?';

    const detalles = productos.map(p => [factura_id, p.producto_id, p.cantidad, p.precio]);

    pool.query(insertDetalle, [detalles], (err) => {
      if (err) {
        console.error('Error al agregar detalles a la factura:', err);
        return res.status(500).json({ error: 'Error al agregar detalles a la factura' });
      }

      // Actualizar stock de productos
      const updateStockPromises = productos.map(p => {
        return new Promise((resolve, reject) => {
          pool.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [p.cantidad, p.producto_id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      Promise.all(updateStockPromises).then(() => {
        // Vaciar carrito después de crear la factura
        pool.query('DELETE FROM carrito_detalle WHERE carrito_id IN (SELECT id FROM carrito WHERE usuario_id = ?)', [usuario_id], (err) => {
          if (err) {
            console.error('Error al vaciar carrito:', err);
          }
          res.status(201).json({ 
            mensaje: 'Factura creada correctamente', 
            factura_id,
            numero_factura: result.insertId // El trigger generará el número automáticamente
          });
        });
      }).catch(err => {
        console.error('Error al actualizar stock:', err);
        res.status(500).json({ error: 'Error al actualizar stock de productos' });
      });
    });
  });
};

// Obtener facturas de un usuario
exports.obtenerFacturasUsuario = (req, res) => {
  const { usuarioId } = req.params;

  const sql = `
    SELECT f.id AS factura_id, f.numero_factura, f.fecha, f.total, f.estado
    FROM facturas f
    WHERE f.usuario_id = ?
    ORDER BY f.fecha DESC
  `;

  pool.query(sql, [usuarioId], (err, results) => {
    if (err) {
      console.error('Error al obtener facturas:', err);
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }
    res.json(results);
  });
};

// Obtener detalles de una factura específica
exports.obtenerDetalleFactura = (req, res) => {
  const { facturaId } = req.params;

  const sql = `
    SELECT fd.id, fd.cantidad, fd.precio, fd.subtotal,
           p.nombre AS producto_nombre, p.imagen,
           c.nombre AS categoria_nombre, m.nombre AS marca_nombre
    FROM factura_detalle fd
    JOIN productos p ON fd.producto_id = p.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN marcas m ON p.marca_id = m.id
    WHERE fd.factura_id = ?
  `;

  pool.query(sql, [facturaId], (err, results) => {
    if (err) {
      console.error('Error al obtener detalles de factura:', err);
      return res.status(500).json({ error: 'Error al obtener detalles de factura' });
    }
    res.json(results);
  });
};

// Obtener todas las facturas (para administradores)
exports.obtenerTodasFacturas = (req, res) => {
  const sql = `
    SELECT f.id, f.numero_factura, f.fecha, f.total, f.estado,
           u.nombre AS nombre_usuario, u.correo AS email_usuario
    FROM facturas f
    JOIN usuarios u ON f.usuario_id = u.id
    ORDER BY f.fecha DESC
  `;

  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener todas las facturas:', err);
      return res.status(500).json({ error: 'Error al obtener facturas' });
    }
    res.json(results);
  });
};

// Actualizar estado de factura
exports.actualizarEstadoFactura = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['pendiente', 'pagada', 'cancelada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  const sql = 'UPDATE facturas SET estado = ? WHERE id = ?';
  pool.query(sql, [estado, id], (err) => {
    if (err) {
      console.error('Error al actualizar estado de factura:', err);
      return res.status(500).json({ error: 'Error al actualizar estado de factura' });
    }
    res.json({ mensaje: 'Estado de factura actualizado correctamente' });
  });
};

// Obtener estadísticas completas
exports.obtenerEstadisticas = (req, res) => {
  const estadisticas = {};

  // 1. Top 5 productos más vendidos
  const sqlProductosVendidos = `
    SELECT p.nombre, p.imagen, SUM(fd.cantidad) AS total_vendidos,
           SUM(fd.cantidad * fd.precio) AS total_ventas
    FROM factura_detalle fd
    JOIN productos p ON fd.producto_id = p.id
    GROUP BY fd.producto_id, p.nombre, p.imagen
    ORDER BY total_vendidos DESC
    LIMIT 5
  `;

  // 2. Ventas por mes (últimos 6 meses)
  const sqlVentasMensuales = `
    SELECT 
      DATE_FORMAT(f.fecha, '%Y-%m') AS mes,
      COUNT(*) AS total_facturas,
      SUM(f.total) AS total_ventas
    FROM facturas f
    WHERE f.fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(f.fecha, '%Y-%m')
    ORDER BY mes DESC
  `;

  // 3. Categorías más vendidas
  const sqlCategoriasVendidas = `
    SELECT c.nombre AS categoria, SUM(fd.cantidad) AS total_vendidos
    FROM factura_detalle fd
    JOIN productos p ON fd.producto_id = p.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
    GROUP BY c.id, c.nombre
    ORDER BY total_vendidos DESC
    LIMIT 5
  `;

  // 4. Marcas más vendidas
  const sqlMarcasVendidas = `
    SELECT m.nombre AS marca, SUM(fd.cantidad) AS total_vendidos
    FROM factura_detalle fd
    JOIN productos p ON fd.producto_id = p.id
    LEFT JOIN marcas m ON p.marca_id = m.id
    GROUP BY m.id, m.nombre
    ORDER BY total_vendidos DESC
    LIMIT 5
  `;

  // 5. Resumen general
  const sqlResumen = `
    SELECT 
      (SELECT COUNT(*) FROM facturas) AS total_facturas,
      (SELECT COALESCE(SUM(total), 0) FROM facturas) AS total_ventas,
      (SELECT COUNT(DISTINCT usuario_id) FROM facturas) AS total_clientes,
      (SELECT COUNT(*) FROM productos) AS total_productos,
      (SELECT AVG(precio) FROM productos) AS precio_promedio
  `;

  // Ejecutar todas las consultas
  Promise.all([
    new Promise((resolve, reject) => {
      pool.query(sqlProductosVendidos, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      pool.query(sqlVentasMensuales, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      pool.query(sqlCategoriasVendidas, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      pool.query(sqlMarcasVendidas, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      pool.query(sqlResumen, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    })
  ]).then(([productosVendidos, ventasMensuales, categoriasVendidas, marcasVendidas, resumen]) => {
    estadisticas.productosVendidos = productosVendidos;
    estadisticas.ventasMensuales = ventasMensuales;
    estadisticas.categoriasVendidas = categoriasVendidas;
    estadisticas.marcasVendidas = marcasVendidas;
    estadisticas.resumen = resumen;
    
    res.json(estadisticas);
  }).catch(err => {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  });
};
