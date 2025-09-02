const express = require('express');
const banguatService= require ('../services/ServiceBanguat');
const authMiddleware= require ('../middlewares/auth.middleware');
const router = express.Router();

// --- Definición de las Rutas del Conversor ---

// URL: GET http://localhost:3000/api/v1/tipo-cambio/dia
// Esta es la parte CLAVE. Observa cómo ponemos al 'authMiddleware' justo en medio,
// antes de la lógica principal de la ruta.

router.get('/dia', authMiddleware, async (req, res)=> {
    try {
        const data= await banguatService.getTipoCambioDia();
        res.json({
            success: true,
            message: 'Tipo de cambio del día obtenido correctamente. ',
            data: data

        });
    }catch (error) {
        res.status(500).json ({
            success: false,
            message: error.message || 'Error interno del servidor.'

        });
    }
});

module.exports = router;
