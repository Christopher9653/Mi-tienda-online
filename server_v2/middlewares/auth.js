// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './config.env' });

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autorización requerido' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto123');
    req.usuario = decoded;
    next();
  } catch (err) {
    console.error('Error de verificación de token:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    } else {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};
