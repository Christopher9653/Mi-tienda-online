const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito');
const auth = require('../middlewares/auth');

// Carrito - todas las rutas requieren autenticación
router.use(auth);

router.post('/crear', carritoController.crearCarrito);
router.get('/:usuarioId', carritoController.obtenerCarrito);
router.post('/agregar', carritoController.agregarProducto);
router.put('/actualizar', carritoController.actualizarCantidad);
router.delete('/eliminar/:detalleId', carritoController.eliminarProducto);
router.delete('/vaciar/:carritoId', carritoController.vaciarCarrito);

module.exports = router;
