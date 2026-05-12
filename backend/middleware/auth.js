const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Sin token' });

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = datos;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}

function soloRol(rol) {
    return (req, res, next) => {
        if (req.usuario.rol !== rol) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        next();
    };
}

module.exports = { verificarToken, soloRol };