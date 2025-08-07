const db = require('../config/db');

exports.crearUsuario = (usuario, callback) => {
  const sql = 'INSERT INTO usuario (nombre, correo, password, rol_id) VALUES (?, ?, ?, ?)';
  db.query(sql, [usuario.nombre, usuario.correo, usuario.password, usuario.rol_id], callback);
};

exports.obtenerUsuarioPorCorreo = (correo, callback) => {
  const sql = 'SELECT * FROM usuario WHERE correo = ?';
  db.query(sql, [correo], callback);
};

exports.obtenerPerfil = (usuario_id, callback) => {
  const sql = 'SELECT id, nombre, correo, rol_id FROM usuario WHERE id = ?';
  db.query(sql, [usuario_id], callback);
};
