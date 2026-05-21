const db = require('../DB');
const bcrypt = require('bcryptjs');

async function getPerfil(req, res) {
    try {
        const [rows] = await db.query(
            'SELECT nombre FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function registrarCliente(req, res) {
    const { nombre, cc, celular, correo, contrasena, plan } = req.body;

    try {
        const [existe] = await db.query(
            'SELECT id FROM usuarios WHERE cc = ?', [cc]
        );
        if (existe.length > 0) {
            return res.status(400).json({ error: 'Ya existe un cliente con esa cédula' });
        }

        const hash = await bcrypt.hash(contrasena, 10);


        const [usuario] = await db.query(
            `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol_id)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [nombre, cc, celular, correo, hash]
        );

        const fechaInicio = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

        await db.query(
            `INSERT INTO membresias (usuario_id, plan, estado, fecha_inicio, fecha_vencimiento)
             VALUES (?, ?, 'activa', ?, ?)`,
            [usuario.insertId, plan, fechaInicio, fechaVencimiento]
        );

        res.status(201).json({ mensaje: 'Cliente registrado correctamente' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function listarClientes(req, res) {
    const { buscar } = req.query;

    try {
        let query = `SELECT u.id, u.nombre, u.cc, u.celular, u.correo, u.estado,
                     m.plan, m.estado AS estado_membresia, m.fecha_vencimiento
                     FROM usuarios u
                     LEFT JOIN membresias m ON u.id = m.usuario_id
                     JOIN roles r ON u.rol_id = r.id
                     WHERE r.nombre = 'cliente'`;
        const params = [];

        if (buscar) {
            query += ' AND (u.nombre LIKE ? OR u.cc LIKE ?)';
            params.push(`%${buscar}%`, `%${buscar}%`);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCliente(req, res) {
    try {
        const [cliente] = await db.query(
            `SELECT u.id, u.nombre, u.cc, u.celular, u.correo, u.estado,
             r.nombre AS rol,
             m.plan, m.estado AS estado_membresia, m.fecha_inicio, m.fecha_vencimiento
             FROM usuarios u
             JOIN roles r ON u.rol_id = r.id
             LEFT JOIN membresias m ON u.id = m.usuario_id
             WHERE u.id = ? AND r.nombre = 'cliente'
             LIMIT 1`,
            [req.params.id]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const [pagos] = await db.query(
            `SELECT monto, fecha_pago, descripcion, plan 
             FROM pagos WHERE usuario_id = ?
             ORDER BY fecha_pago DESC`,
            [req.params.id]
        );

        res.json({
            ...cliente[0],
            pagos: pagos
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function actualizarCliente(req, res) {
    const { nombre, celular, correo } = req.body;

    if (!nombre || !celular || !correo) {
        return res.status(400).json({ error: 'Nombre, celular y correo son obligatorios' });
    }

    try {
        const [existe] = await db.query(
            `SELECT id FROM usuarios WHERE id = ? AND rol_id = 1`,
            [req.params.id]
        );

        if (existe.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        await db.query(
            'UPDATE usuarios SET nombre = ?, celular = ?, correo = ? WHERE id = ?',
            [nombre, celular, correo, req.params.id]
        );

        res.json({ mensaje: 'Cliente actualizado correctamente' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function registrarPago(req, res) {
    const { usuario_id, monto, descripcion, plan } = req.body;

    try {
        await db.query(
            'INSERT INTO pagos (usuario_id, monto, descripcion, plan) VALUES (?, ?, ?, ?)',
            [usuario_id, monto, descripcion, plan]
        );

        const fechaInicio = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

        await db.query(
            `UPDATE membresias 
             SET estado = 'activa', plan = ?, fecha_inicio = ?, fecha_vencimiento = ?
             WHERE usuario_id = ?`,
            [plan, fechaInicio, fechaVencimiento, usuario_id]
        );

        res.status(201).json({ mensaje: 'Pago registrado y membresía actualizada' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getSolicitudes(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT s.id, s.tipo, s.estado, s.fecha, s.plan_solicitado,
             u.nombre, u.cc, u.correo
             FROM solicitudes s
             JOIN usuarios u ON s.usuario_id = u.id
             WHERE s.estado = 'pendiente'
             ORDER BY s.fecha DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function responderSolicitud(req, res) {
    const { estado } = req.body;

    try {
        const [solicitud] = await db.query(
            'SELECT * FROM solicitudes WHERE id = ?',
            [req.params.id]
        );

        if (solicitud.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        await db.query(
            'UPDATE solicitudes SET estado = ? WHERE id = ?',
            [estado, req.params.id]
        );

        if (estado === 'aceptada') {
            if (solicitud[0].tipo === 'baja') {
                await db.query(
                    `UPDATE membresias SET estado = 'suspendida' WHERE usuario_id = ?`,
                    [solicitud[0].usuario_id]
                );
            } else if (solicitud[0].tipo === 'cambio_plan') {
                await db.query(
                    `UPDATE membresias SET plan = ? WHERE usuario_id = ?`,
                    [solicitud[0].plan_solicitado, solicitud[0].usuario_id]
                );
            }
        }

        res.json({ mensaje: `Solicitud ${estado} correctamente` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { registrarCliente, listarClientes, getCliente, actualizarCliente, registrarPago, getPerfil, getSolicitudes, responderSolicitud };
