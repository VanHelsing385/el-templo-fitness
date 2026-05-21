const router = require('express').Router();
const { verificarToken, soloRol } = require('../middleware/auth');
const { getPerfil, getMembresia, getPagos, solicitarBaja, solicitarCambioPlan } = require('../controllers/clienteController');

router.use(verificarToken);
router.use(soloRol('cliente'));

router.get('/perfil', getPerfil);
router.get('/membresia', getMembresia);
router.get('/pagos', getPagos);
router.post('/solicitud-baja', solicitarBaja);
router.post('/solicitud-cambio-plan', solicitarCambioPlan);

module.exports = router;