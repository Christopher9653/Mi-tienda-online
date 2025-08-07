const db = require('../config/db');

exports.obtenerCarrito = (usuario_id, callback) => {
  const sql = `
    SELECT c.id AS carrito_id, cd.id AS detalle_id, p.nombre, cd.cantidad, p.precio, (cd.cantidad * p.precio) AS subtotal
    FROM carrito c
    JOIN carrito_detalle cd ON c.id = cd.carrito_id
    JOIN productos p ON cd.producto_id = p.id
    WHERE c.usuario_id = ?
  `;
  db.query(sql, [usuario_id], callback);
};

exports.agregarProducto = (carrito_id, producto_id, cantidad, callback) => {
  const sql = 'INSERT INTO carrito_detalle (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)';
  db.query(sql, [carrito_id, producto_id, cantidad], callback);
};

exports.actualizarCantidad = (detalle_id, cantidad, callback) => {
  const sql = 'UPDATE carrito_detalle SET cantidad = ? WHERE id = ?';
  db.query(sql, [cantidad, detalle_id], callback);
};

exports.eliminarProducto = (detalle_id, callback) => {
  const sql = 'DELETE FROM carrito_detalle WHERE id = ?';
  db.query(sql, [detalle_id], callback);
};

exports.crearCarrito = (usuario_id, callback) => {
  db.query('INSERT INTO carrito (usuario_id) VALUES (?)', [usuario_id], callback);
};

exports.obtenerCarritoId = (usuario_id, callback) => {
  db.query('SELECT id FROM carrito WHERE usuario_id = ?', [usuario_id], callback);
};

exports.vaciarCarrito = (carrito_id, callback) => {
  db.query('DELETE FROM carrito_detalle WHERE carrito_id = ?', [carrito_id], callback);
};
