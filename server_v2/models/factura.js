const db = require('../config/db');

exports.crearFactura = (usuario_id, productos, callback) => {
  const insertFactura = 'INSERT INTO factura (usuario_id, fecha) VALUES (?, NOW())';
  db.query(insertFactura, [usuario_id], (err, result) => {
    if (err) return callback(err);

    const factura_id = result.insertId;
    const insertDetalle = 'INSERT INTO factura_detalle (factura_id, producto_id, cantidad, precio_unitario) VALUES ?';

    const detalles = productos.map(p => [factura_id, p.producto_id, p.cantidad, p.precio]);

    db.query(insertDetalle, [detalles], (err) => {
      if (err) return callback(err);
      callback(null, { factura_id });
    });
  });
};

exports.obtenerFacturasUsuario = (usuario_id, callback) => {
  const sql = `
    SELECT f.id, f.fecha, SUM(fd.cantidad * fd.precio_unitario) AS total
    FROM factura f
    JOIN factura_detalle fd ON f.id = fd.factura_id
    WHERE f.usuario_id = ?
    GROUP BY f.id
    ORDER BY f.fecha DESC
  `;
  db.query(sql, [usuario_id], callback);
};

exports.obtenerEstadisticas = (callback) => {
  const sql = `
    SELECT p.nombre, SUM(fd.cantidad) AS total_vendidos
    FROM factura_detalle fd
    JOIN productos p ON fd.producto_id = p.id
    GROUP BY fd.producto_id
    ORDER BY total_vendidos DESC
    LIMIT 5
  `;
  db.query(sql, callback);
};