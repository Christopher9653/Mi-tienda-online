const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria');
const auth = require('../middlewares/auth');

// Rutas públicas
router.get('/', categoriaController.obtenerCategorias);

// Rutas protegidas (solo admin)
router.post('/', auth, categoriaController.crearCategoria);
router.put('/:id', auth, categoriaController.actualizarCategoria);
router.delete('/:id', auth, categoriaController.eliminarCategoria);

module.exports = router;
