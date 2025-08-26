// services/banguatService.js
const soap = require('soap');

const WSDL_URL = 'http://www.banguat.gob.gt/variables/ws/TipoCambio.asmx?WSDL'; // Asegúrate de que esta es la URL correcta

async function getTipoCambioDia() {
    try {
        const client = await soap.createClientAsync(WSDL_URL);
        const result = await client.TipoCambioDiaAsync({});

        // *** Esta es la línea clave y ahora es correcta para tu nuevo JSON ***
        const tipoCambioArray =  result[0]?.TipoCambioDiaResult?.CambioDolar?.VarDolar;

        if (tipoCambioArray && Array.isArray(tipoCambioArray) && tipoCambioArray.length > 0) {
            const tipoCambioUSD = parseFloat(tipoCambioArray[0].referencia);

            return {
                fecha: tipoCambioArray[0].fecha,
                valor: tipoCambioUSD
            };
        } else {
            throw new Error('No se encontraron datos de tipo de cambio en la respuesta del BANGUAT.');
        }
    } catch (error) {
        console.error('Error al consumir el servicio SOAP del BANGUAT:', error);
        throw new Error('No se pudo obtener el tipo de cambio del BANGUAT.');
    }
}

module.exports = {
    getTipoCambioDia,
    
};