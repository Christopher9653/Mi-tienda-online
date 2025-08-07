const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura');
const auth = require('../middlewares/auth');

// Rutas para facturas
router.post('/', auth, facturaController.crearFactura);
router.get('/usuario/:usuarioId', auth, facturaController.obtenerFacturasUsuario);
router.get('/detalle/:facturaId', auth, facturaController.obtenerDetalleFactura);
router.get('/todas', auth, facturaController.obtenerTodasFacturas);
router.put('/:id/estado', auth, facturaController.actualizarEstadoFactura);
router.get('/estadisticas/completas', auth, facturaController.obtenerEstadisticas);

module.exports = router;
