const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario');
const auth = require('../middlewares/auth');

router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);
router.get('/perfil/:id', auth, usuarioController.obtenerPerfilPorId);
router.put('/perfil/:id', auth, usuarioController.actualizarPerfil);

// Rutas para restablecimiento de contraseña
router.post('/solicitar-reset', usuarioController.solicitarResetPassword);
router.post('/verificar-codigo', usuarioController.verificarResetCode);
router.post('/reset-password', usuarioController.resetPassword);

module.exports = router;
