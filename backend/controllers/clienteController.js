const db = require('../DB');

async function getPerfil(req, res) {
    try {
        const [rows] = await db.query(
            'SELECT id, nombre, cc, celular, correo, fecha_registro FROM usuarios WHERE id = ?',
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
            'SELECT monto, fecha_pago, descripcion, plan FROM pagos WHERE usuario_id = ? ORDER BY fecha_pago DESC',
            [req.usuario.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function solicitarBaja(req, res) {
    try {
        // Verificar si ya tiene una solicitud pendiente
        const [existe] = await db.query(
            `SELECT id FROM solicitudes WHERE usuario_id = ? AND estado = 'pendiente'`,
            [req.usuario.id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ error: 'Ya tienes una solicitud de baja pendiente.' });
        }

        await db.query(
            `INSERT INTO solicitudes (usuario_id, tipo) VALUES (?, 'baja')`,
            [req.usuario.id]
        );

        res.json({ mensaje: 'Solicitud de baja enviada correctamente. El recepcionista la procesará pronto.' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function solicitarCambioPlan(req, res) {
    const { plan } = req.body;

    try {
        const [existe] = await db.query(
            `SELECT id FROM solicitudes WHERE usuario_id = ? AND estado = 'pendiente'`,
            [req.usuario.id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ error: 'Ya tienes una solicitud pendiente.' });
        }

        await db.query(
            `INSERT INTO solicitudes (usuario_id, tipo, plan_solicitado) VALUES (?, 'cambio_plan', ?)`,
            [req.usuario.id, plan]
        );

        res.json({ mensaje: `Solicitud de cambio a Plan ${plan === 'pro' ? 'Pro' : 'Simple'} enviada. El recepcionista la procesará pronto.` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getPerfil, getMembresia, getPagos, solicitarBaja, solicitarCambioPlan };
