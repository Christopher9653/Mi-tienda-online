const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

// Registro de usuario (solo clientes)
exports.register = (req, res) => {
  const { nombre, correo, contrasena, direccion, telefono } = req.body;
  
  // Validaciones básicas
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const hash = bcrypt.hashSync(contrasena, 10);
  const sql = 'INSERT INTO usuarios (nombre, correo, contrasena, direccion, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)';
  
  pool.query(sql, [nombre, correo, hash, direccion, telefono, 'usuario'], (err) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  });
};

// Login para cliente o admin
exports.login = (req, res) => {
  const { correo, contrasena } = req.body;
  
  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  const sql = 'SELECT * FROM usuarios WHERE correo = ?';

  pool.query(sql, [correo], (err, results) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = results[0];
    const passwordCorrecta = bcrypt.compareSync(contrasena, usuario.contrasena);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({
      id: usuario.id,
      rol: usuario.rol
    }, process.env.JWT_SECRET || 'secreto123', { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    });

    res.json({ 
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  });
};

// Perfil del usuario
exports.perfil = (req, res) => {
  const sql = 'SELECT id, nombre, correo, direccion, telefono, rol FROM usuarios WHERE id = ?';
  pool.query(sql, [req.usuario.id], (err, results) => {
    if (err) {
      console.error('Error al obtener perfil:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  });
};

// Obtener perfil por ID (para el componente Perfil.js)
exports.obtenerPerfilPorId = (req, res) => {
  const { id } = req.params;
  
  const sql = 'SELECT id, nombre, correo, direccion, telefono, rol FROM usuarios WHERE id = ?';
  
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener perfil:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(results[0]);
  });
};

// Actualizar perfil
exports.actualizarPerfil = (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono } = req.body;
  
  const sql = 'UPDATE usuarios SET nombre = ?, direccion = ?, telefono = ? WHERE id = ?';
  
  pool.query(sql, [nombre, direccion, telefono, id], (err) => {
    if (err) {
      console.error('Error al actualizar perfil:', err);
      return res.status(500).json({ error: 'Error al actualizar perfil' });
    }
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  });
};

// Solicitar restablecimiento de contraseña
exports.solicitarResetPassword = (req, res) => {
  const { correo } = req.body;
  
  if (!correo) {
    return res.status(400).json({ error: 'El correo es requerido' });
  }

  // Verificar si el usuario existe
  const sql = 'SELECT id, nombre FROM usuarios WHERE correo = ?';
  
  pool.query(sql, [correo], (err, results) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con este correo' });
    }

    const usuario = results[0];
    
    // Generar código de restablecimiento
    const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    
    // Guardar el código en la base de datos
    const updateSql = 'UPDATE usuarios SET reset_code = ?, reset_expires = ? WHERE id = ?';
    
    pool.query(updateSql, [resetCode, resetExpires, usuario.id], (err) => {
      if (err) {
        console.error('Error al guardar código de reset:', err);
        return res.status(500).json({ error: 'Error al procesar la solicitud' });
      }
      
      // Configurar el transportador de correo
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'tu-email@gmail.com',
          pass: process.env.EMAIL_PASS || 'tu-password-de-app'
        }
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'tu-email@gmail.com',
        to: correo,
        subject: 'Restablecimiento de Contraseña - Mi Tienda Online',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
            <h2 style="text-align: center; margin-bottom: 30px;">🔐 Restablecimiento de Contraseña</h2>
            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
              <h1 style="font-size: 2.5rem; margin: 0; letter-spacing: 10px; font-weight: bold;">${resetCode}</h1>
            </div>
            <p><strong>Este código expira en 30 minutos.</strong></p>
            <p>Si no solicitaste este restablecimiento, puedes ignorar este correo.</p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.3); margin: 20px 0;">
            <p style="text-align: center; font-size: 0.9rem; opacity: 0.8;">
              Mi Tienda Online - Tu tienda de confianza
            </p>
          </div>
        `
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error al enviar correo:', error);
          return res.status(500).json({ error: 'Error al enviar el correo de restablecimiento' });
        }
        
        res.json({ 
          mensaje: 'Se ha enviado un código de restablecimiento a tu correo',
          correo: correo
        });
      });
    });
  });
};

// Verificar código de restablecimiento
exports.verificarResetCode = (req, res) => {
  const { correo, codigo } = req.body;
  
  if (!correo || !codigo) {
    return res.status(400).json({ error: 'Correo y código son requeridos' });
  }

  const sql = 'SELECT id, reset_code, reset_expires FROM usuarios WHERE correo = ?';
  
  pool.query(sql, [correo], (err, results) => {
    if (err) {
      console.error('Error al verificar código:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];
    
    if (!usuario.reset_code || !usuario.reset_expires) {
      return res.status(400).json({ error: 'No hay un código de restablecimiento válido' });
    }
    
    if (usuario.reset_code !== codigo.toUpperCase()) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }
    
    if (new Date() > new Date(usuario.reset_expires)) {
      return res.status(400).json({ error: 'El código ha expirado' });
    }
    
    res.json({ 
      mensaje: 'Código verificado correctamente',
      usuario_id: usuario.id
    });
  });
};

// Restablecer contraseña
exports.resetPassword = (req, res) => {
  const { correo, codigo, nuevaContrasena } = req.body;
  
  if (!correo || !codigo || !nuevaContrasena) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const sql = 'SELECT id, reset_code, reset_expires FROM usuarios WHERE correo = ?';
  
  pool.query(sql, [correo], (err, results) => {
    if (err) {
      console.error('Error al verificar código:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];
    
    if (!usuario.reset_code || !usuario.reset_expires) {
      return res.status(400).json({ error: 'No hay un código de restablecimiento válido' });
    }
    
    if (usuario.reset_code !== codigo.toUpperCase()) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }
    
    if (new Date() > new Date(usuario.reset_expires)) {
      return res.status(400).json({ error: 'El código ha expirado' });
    }
    
    // Hashear la nueva contraseña
    const hash = bcrypt.hashSync(nuevaContrasena, 10);
    
    // Actualizar contraseña y limpiar código de reset
    const updateSql = 'UPDATE usuarios SET contrasena = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?';
    
    pool.query(updateSql, [hash, usuario.id], (err) => {
      if (err) {
        console.error('Error al actualizar contraseña:', err);
        return res.status(500).json({ error: 'Error al restablecer la contraseña' });
      }
      
      res.json({ mensaje: 'Contraseña restablecida correctamente' });
    });
  });
};
