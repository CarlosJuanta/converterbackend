//database/connection.js

const {createCliente, createClient} = require ("@libsql/client")

//Se crea el canal de comunicaicon para hablar con turso, usando las credenciales configuradas

const db= createClient ({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = db;