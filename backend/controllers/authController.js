const db = require('../DB');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function login(req, res) {
    const { correo, contrasena } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE correo = ?', 
            [correo]
        );

        const usuario = rows[0];

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, rol: usuario.rol });

    } catch (err) {
        res.status(500).json({ error: 'Error del servidor', detalle: err.message });
    }
}

module.exports = { login };