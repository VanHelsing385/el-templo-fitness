const router = require('express').Router();
const { verificarToken, soloRol } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { registrarCliente, listarClientes, getCliente, actualizarCliente, registrarPago, getPerfil, getSolicitudes, responderSolicitud, getActividadReciente } = require('../controllers/recepController');

router.use(verificarToken);
router.use(soloRol('recepcionista'));

router.post('/clientes', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('cc').notEmpty().withMessage('La cédula es obligatoria'),
    body('correo').isEmail().withMessage('El correo no es válido'),
    body('celular').notEmpty().withMessage('El celular es obligatorio'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
    body('plan').isIn(['simple', 'pro']).withMessage('El plan debe ser simple o pro'),
], (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}, registrarCliente);

router.post('/pagos', [
    body('usuario_id').notEmpty().withMessage('El usuario es obligatorio'),
    body('monto').isNumeric().withMessage('El monto debe ser un número'),
    body('plan').isIn(['simple', 'pro']).withMessage('El plan debe ser simple o pro'),
], (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}, registrarPago);

router.put('/clientes/:id', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('celular').notEmpty().withMessage('El celular es obligatorio'),
    body('correo').isEmail().withMessage('El correo no es válido'),
], (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}, actualizarCliente);

router.get('/clientes', listarClientes);
router.get('/clientes/:id', getCliente);
router.get('/perfil', getPerfil);
router.get('/solicitudes', getSolicitudes);
router.put('/solicitudes/:id', responderSolicitud);
router.get('/actividad', getActividadReciente);

module.exports = router;