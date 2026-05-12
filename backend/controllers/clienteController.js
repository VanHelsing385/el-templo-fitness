const db = require('../DB');

async function getPerfil(req, res) {
    try {
        const [rows] = await db.query(
            'SELECT id, nombre, cc, celular, correo FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getMembresia(req, res) {
    try {
        const [rows] = await db.query(
            'SELECT plan, estado, fecha_inicio, fecha_vencimiento FROM membresias WHERE usuario_id = ?',
            [req.usuario.id]
        );
        res.json(rows[0] || { mensaje: 'Sin membresía activa' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getPagos(req, res) {
    try {
        const [rows] = await db.query(
            'SELECT monto, fecha_pago, descripcion FROM pagos WHERE usuario_id = ? ORDER BY fecha_pago DESC',
            [req.usuario.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getPerfil, getMembresia, getPagos };