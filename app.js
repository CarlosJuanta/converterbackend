// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar servicios mapas de rutas
const authRoutes = require('./routes/auth.routes');
const converterRoutes = require('./routes/converter.routes');
const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuración de Middlewares ---
app.use(express.json());
app.use(cookieParser());

// ===================================================================
// ===== INICIO DE LA MODIFICACIÓN =====
// ===================================================================

// --- Configuración del CORS para permitir la comunicación con el frontend ---
const corsOptions = {
  // Cuando trabajas con credenciales (cookies), debes especificar el origen exacto.
  // El comodín '*' no está permitido por razones de seguridad.
  // Leemos la URL del frontend desde el archivo .env, y si no existe, usamos la de desarrollo local.
  origin: process.env.FRONTEND_URL || 'https://convertidorqtz.netlify.app/login',
  
  // ¡ESTA ES LA LÍNEA CLAVE QUE SOLUCIONA TU ERROR!
  // Le dice al navegador que este servidor SÍ acepta peticiones con credenciales (cookies).
  credentials: true,
};

app.use(cors(corsOptions));

// ===================================================================
// ===== FIN DE LA MODIFICACIÓN =====
// ===================================================================

// --- Conectamos los mapas a la aplicación principal ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tipo-cambio', converterRoutes);

// Ruta por defecto para saber que la API está viva
app.get('/', (req, res) => {
    res.send('API REST para el banco de Guatemala con autenticación');
});

// Iniciar el servidor 
app.listen(PORT, () => {
    console.log(`Servidor API REST escuchando en el puerto ${PORT}`);
    console.log('El sistema de autenticación está listo y activo!');
});