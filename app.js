// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const banguatService = require('./services/ServiceBanguat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- ESTE ES EL CAMBIO IMPORTANTE ---
const corsOptions = {
  // Usamos una variable de entorno para la URL del frontend.
  // Si no está definida, se usa '*', lo cual es útil para pruebas iniciales.
  origin: process.env.FRONTEND_URL || '*'
};

app.use(cors(corsOptions));
// ------------------------------------

// Ruta para obtener el tipo de cambio del día
app.get('/api/v1/tipo-cambio/dia', async (req, res) => {
    try {
        const data = await banguatService.getTipoCambioDia();
        res.json({
            success: true,
            message: 'Tipo de cambio del día obtenido correctamente.',
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor al obtener el tipo de cambio del día.'
        });
    }
});

// Ruta por defecto
app.get('/', (req, res) => {
    res.send('API REST para el Banco de Guatemala. Visita /api/v1/tipo-cambio/dia o /api/v1/tipo-cambio/rango');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor API REST escuchando en el puerto ${PORT}`);
});