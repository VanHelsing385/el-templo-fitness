const bcrypt = require('bcryptjs');
const db = require('./DB');

async function crearUsuario() {
    const hash = await bcrypt.hash('password123', 10);
    
    await db.query(
        `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Recepcionista Prueba', '999999999', '3009999999', 'recep2@templo.com', hash, 'recepcionista']
    );

    console.log('Usuario creado con hash:', hash);
    process.exit();
}

crearUsuario();