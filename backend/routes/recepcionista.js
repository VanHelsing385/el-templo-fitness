const router = require('express').Router();
const { verificarToken, soloRol } = require('../middleware/auth');
const { registrarCliente, listarClientes, getCliente, actualizarCliente, registrarPago } = require('../controllers/recepController');

router.use(verificarToken);
router.use(soloRol('recepcionista'));

router.post('/clientes', registrarCliente);
router.get('/clientes', listarClientes);
router.get('/clientes/:id', getCliente);
router.put('/clientes/:id', actualizarCliente);
router.post('/pagos', registrarPago);

module.exports = router;