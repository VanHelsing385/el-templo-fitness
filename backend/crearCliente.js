const bcrypt = require('bcryptjs');
const db = require('./DB');

async function crearCliente() {
    const hash = await bcrypt.hash('cliente123', 10);
    
    await db.query(
        `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Juan Cliente', '111111111', '3001111111', 'juan@templo.com', hash, 'cliente']
    );

    console.log('Cliente creado');
    process.exit();
}

crearCliente();