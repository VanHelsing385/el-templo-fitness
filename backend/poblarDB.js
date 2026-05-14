const bcrypt = require('bcryptjs');
const db = require('./DB');

async function poblar() {
    console.log('Poblando base de datos...');

    // Crear recepcionista
    const hashRecep = await bcrypt.hash('recep123', 10);
    await db.query(
        `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol_id) VALUES (?, ?, ?, ?, ?, 2)`,
        ['Angelina Figueroa', '999999999', '3001112233', 'angelina@templo.com', hashRecep]
    );
    console.log('✓ Recepcionista creada');

    // Lista de clientes
    const clientes = [
        { nombre: 'Juan Manuel Armella', cc: '1001111111', celular: '3001111111', correo: 'juan@templo.com', plan: 'simple', estado: 'activa', meses: 3 },
        { nombre: 'Carlos Torres Ruiz', cc: '1002222222', celular: '3002222222', correo: 'carlos@templo.com', plan: 'pro', estado: 'activa', meses: 5 },
        { nombre: 'Maria Fernanda Lopez', cc: '1003333333', celular: '3003333333', correo: 'maria@templo.com', plan: 'simple', estado: 'activa', meses: 2 },
        { nombre: 'Darlinson Barreto', cc: '1004444444', celular: '3004444444', correo: 'darlinson@templo.com', plan: 'pro', estado: 'activa', meses: 4 },
        { nombre: 'Miguel Angel Caicedo', cc: '1005555555', celular: '3005555555', correo: 'miguel@templo.com', plan: 'simple', estado: 'vencida', meses: 1 },
        { nombre: 'Laura Gomez Perez', cc: '1006666666', celular: '3006666666', correo: 'laura@templo.com', plan: 'pro', estado: 'activa', meses: 6 },
        { nombre: 'Felipe Diaz Mora', cc: '1007777777', celular: '3007777777', correo: 'felipe@templo.com', plan: 'simple', estado: 'suspendida', meses: 1 },
        { nombre: 'Daniela Vargas Gil', cc: '1008888888', celular: '3008888888', correo: 'daniela@templo.com', plan: 'pro', estado: 'activa', meses: 3 },
        { nombre: 'Andres Felipe Pena', cc: '1009999999', celular: '3009999999', correo: 'andres@templo.com', plan: 'simple', estado: 'vencida', meses: 2 },
        { nombre: 'Valentina Rios Castro', cc: '1010101010', celular: '3010101010', correo: 'valentina@templo.com', plan: 'pro', estado: 'activa', meses: 4 },
    ];

    for (const c of clientes) {
        const hash = await bcrypt.hash('cliente123', 10);

        // Insertar usuario
        const [result] = await db.query(
            `INSERT INTO usuarios (nombre, cc, celular, correo, contrasena, rol_id) VALUES (?, ?, ?, ?, ?, 1)`,
            [c.nombre, c.cc, c.celular, c.correo, hash]
        );

        const usuarioId = result.insertId;
        const monto = c.plan === 'pro' ? 90000 : 70000;

        // Calcular fechas
        const fechaVencimiento = new Date();
        if (c.estado === 'activa') {
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
        } else {
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() - 1);
        }

        // fecha_inicio es siempre 1 mes antes del vencimiento
        const fechaInicio = new Date(fechaVencimiento);
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        
        // Insertar membresía
        await db.query(
            `INSERT INTO membresias (usuario_id, plan, estado, fecha_inicio, fecha_vencimiento) VALUES (?, ?, ?, ?, ?)`,
            [usuarioId, c.plan, c.estado, fechaInicio, fechaVencimiento]
        );

        // Insertar pagos históricos
        for (let i = c.meses; i >= 1; i--) {
            const fechaPago = new Date();
            fechaPago.setMonth(fechaPago.getMonth() - i);
            await db.query(
                `INSERT INTO pagos (usuario_id, monto, fecha_pago, descripcion, plan) VALUES (?, ?, ?, ?, ?)`,
                [usuarioId, monto, fechaPago, `Mensualidad ${fechaPago.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}`, c.plan]
            );
        }

        console.log(`✓ Cliente creado: ${c.nombre}`);
    }

    console.log('\n✅ Base de datos poblada correctamente');
    console.log('Recepcionista: angelina@templo.com / recep123');
    console.log('Clientes: [correo]@templo.com / cliente123');
    process.exit();
}

poblar().catch(err => {
    console.error('Error:', err.message);
    process.exit();
});