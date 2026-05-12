const bcrypt = require('bcryptjs');
const db = require('./DB');

async function crearRecep() {
    const hash = await bcrypt.hash('recep123', 10);
    
    await db.query(
        `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol_id)
         VALUES (?, ?, ?, ?, ?, 2)`,
        ['Recepcionista Prueba', '999999999', '3009999999', 'recep@templo.com', hash]
    );

    console.log('Recepcionista creado');
    process.exit();
}

crearRecep();