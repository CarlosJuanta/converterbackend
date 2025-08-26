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

// Ruta para obtener el tipo de cambio en un rango de fechas
// Ejemplo: /api/v1/tipo-cambio/rango?fechaInicio=2023-01-01&fechaFin=2023-01-07
app.get('/api/v1/tipo-cambio/rango', async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
            success: false,
            message: 'Se requieren las fechas de inicio y fin (fechaInicio, fechaFin) como parámetros de consulta.'
        });
    }

    // Validación básica de formato de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaInicio) || !dateRegex.test(fechaFin)) {
        return res.status(400).json({
            success: false,
            message: 'El formato de fecha debe ser YYYY-MM-DD.'
        });
    }

    try {
        const data = await banguatService.getTipoCambioRango(fechaInicio, fechaFin);
        res.json({
            success: true,
            message: `Tipo de cambio para el rango ${fechaInicio} - ${fechaFin} obtenido correctamente.`,
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor al obtener el tipo de cambio por rango.'
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