const router = require('express').Router();
const { verificarToken, soloRol } = require('../middleware/auth');
const { getPerfil, getMembresia, getPagos } = require('../controllers/clienteController');

router.use(verificarToken);
router.use(soloRol('cliente'));

router.get('/perfil', getPerfil);
router.get('/membresia', getMembresia);
router.get('/pagos', getPagos);

module.exports = router;