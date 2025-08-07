const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto');
const auth = require('../middlewares/auth');

// Rutas públicas
router.get('/', productoController.listar);
router.get('/:id', productoController.obtenerPorId);

// Rutas protegidas (requieren autenticación)
router.post('/', auth, productoController.uploadMiddleware, productoController.crear);
router.put('/:id', auth, productoController.uploadMiddleware, productoController.actualizar);
router.delete('/:id', auth, productoController.eliminar);

module.exports = router;
