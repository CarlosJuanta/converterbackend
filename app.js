// app.js
require('dotenv').config(); // Carga las variables de entorno
const express = require('express'); 
const cors = require('cors');
const banguatService = require('./services/ServiceBanguat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json()); 


// Permitir peticiones desde tu frontend
app.use(cors({
  origin: 'http://localhost:5173'  // o '*' para todos
}));

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
    console.log(`Accede a http://localhost:${PORT}`);
});