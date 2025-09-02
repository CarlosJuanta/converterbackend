const express = require ("express");
const {register, login }= require ('../controllers/auth.controller');
const router = express.Router();


// --- Definición de las Rutas de Autenticación ---

// URL: POST http://localhost:3000/api/v1/auth/register
// Cuando alguien haga una petición POST a esta URL, se ejecutará la función 'register'
// que importamos desde nuestro controlador.

router.post('/register', register);


// URL: POST http://localhost:3000/api/v1/auth/login
// Cuando alguien haga una petición POST a esta URL, se ejecutará la función 'login'
// de nuestro controlador.

router.post ('/login', login);

//Exportamos este mapa para que nuestra aplicación principal pueda usarlo.

module.exports =router;