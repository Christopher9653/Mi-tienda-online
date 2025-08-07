const db = require('../config/db');

exports.obtenerProductos = (callback) => {
  db.query('SELECT * FROM productos', callback);
};

exports.crearProducto = (producto, callback) => {
  const sql = 'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)';
  db.query(sql, [producto.nombre, producto.descripcion, producto.precio, producto.stock], callback);
};

exports.actualizarProducto = (id, producto, callback) => {
  const sql = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';
  db.query(sql, [producto.nombre, producto.descripcion, producto.precio, producto.stock, id], callback);
};

exports.eliminarProducto = (id, callback) => {
  db.query('DELETE FROM productos WHERE id = ?', [id], callback);
};