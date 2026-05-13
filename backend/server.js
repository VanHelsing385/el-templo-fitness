const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); // Para permitir las peticiones del frontend
app.use(express.json()); // Para leer el body de las peticiones


const authRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/cliente');
const recepRoutes = require('./routes/recepcionista');

app.use('/auth', authRoutes);
app.use('/cliente', clienteRoutes);
app.use('/recepcionista', recepRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});