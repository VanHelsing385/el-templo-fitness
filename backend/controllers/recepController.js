const db = require('../DB');
const bcrypt = require('bcryptjs');

async function registrarCliente(req, res) {
    const { nombre, cc, celular, correo, contrasena, plan } = req.body;

    try {
        // Verificar que no exista el CC
        const [existe] = await db.query(
            'SELECT id FROM usuarios WHERE cc = ?', [cc]
        );
        if (existe.length > 0) {
            return res.status(400).json({ error: 'Ya existe un cliente con esa cédula' });
        }

        const hash = await bcrypt.hash(contrasena, 10);

        const [usuario] = await db.query(
            `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol)
             VALUES (?, ?, ?, ?, ?, 'cliente')`,
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
        let query = `SELECT u.id, u.nombre, u.cc, u.celular, u.correo, 
                     m.plan, m.estado, m.fecha_vencimiento
                     FROM usuarios u
                     LEFT JOIN membresias m ON u.id = m.usuario_id
                     WHERE u.rol = 'cliente'`;
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
            `SELECT u.id, u.nombre, u.cc, u.celular, u.correo,
             m.plan, m.estado, m.fecha_inicio, m.fecha_vencimiento
             FROM usuarios u
             LEFT JOIN membresias m ON u.id = m.usuario_id
             WHERE u.id = ? AND u.rol = 'cliente'`,
            [req.params.id]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const [pagos] = await db.query(
            `SELECT monto, fecha, descripcion 
             FROM pagos WHERE usuario_id = ?
             ORDER BY fecha DESC`,
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

    try {
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
        const fecha = new Date();

        await db.query(
            'INSERT INTO pagos (usuario_id, monto, fecha, descripcion) VALUES (?, ?, ?, ?)',
            [usuario_id, monto, fecha, descripcion]
        );

        const nuevaFecha = new Date();
        nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);

        await db.query(
            `UPDATE membresias 
             SET estado = 'activa', plan = ?, fecha_inicio = ?, fecha_vencimiento = ?
             WHERE usuario_id = ?`,
            [plan, fecha, nuevaFecha, usuario_id]
        );

        res.status(201).json({ mensaje: 'Pago registrado y membresía actualizada' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { registrarCliente, listarClientes, getCliente, actualizarCliente, registrarPago };