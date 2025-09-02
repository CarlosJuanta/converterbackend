// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');  //añadido lector de Cookies 

//importar servicios mapas de rutas

const authRoutes = require ('./routes/auth.routes');
const converterRoutes = require ('./routes/converter.routes');
const app = express();
const PORT = process.env.PORT || 3000;


// --- Configuración de Middlewares (Herramientas que se usan en TODAS las peticiones) ---
app.use(express.json()); //permite a Exprrres entender el fomrato JSON en las petiticones
app.use(cookieParser()); //activa el lector de cookes

// --- configuración del CORS  para permitir la comunicación  con el frontend
const corsOptions = {
  // Usamos una variable de entorno para la URL del frontend.
  // Si no está definida, se usa '*', lo cual es útil para pruebas iniciales.
  origin: process.env.FRONTEND_URL || '*'
};

app.use(cors(corsOptions));
// ------------------------------------

// --- Conectamos los mapas a la aplicación principal ---
// Le decimos a Express: "Si una URL empieza con /api/v1/auth, usa el mapa 'authRoutes'".
app.use('/api/v1/auth', authRoutes);

// Le decimos: "Si una URL empieza con /api/v1/tipo-cambio, usa el mapa 'converterRoutes'".
app.use('/api/v1/tipo-cambio', converterRoutes);




//Rutas  por defecto para saber que la API está viva

app.get ('/', (req, res)=> {
    res.send('API REST para el banco de Guatemala con autenticación');
});

//iniciar el servidor 

app.listen(PORT,() => {
    console.log(`Servidor API REST escuchando en el puerto ${PORT}`);
    console.log ('El sistema de autenticación está listo y activo!');
})