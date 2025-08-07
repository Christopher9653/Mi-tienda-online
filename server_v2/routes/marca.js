const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marca');
const auth = require('../middlewares/auth');

// Rutas públicas
router.get('/', marcaController.obtenerMarcas);

// Rutas protegidas (solo admin)
router.post('/', auth, marcaController.crearMarca);
router.put('/:id', auth, marcaController.actualizarMarca);
router.delete('/:id', auth, marcaController.eliminarMarca);

module.exports = router;
