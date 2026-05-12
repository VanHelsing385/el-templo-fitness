const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'el_templo_fitness'
});

pool.getConnection((err) => {
    if (err) {
        console.log('Error de conexión:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});

module.exports = pool.promise();