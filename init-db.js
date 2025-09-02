require ('dotenv').config();
const db = require ('./database/connection');

async function setupDatabase (){
    try {
        console.log ("Creando la tabla 'users' si no existe");
        // Este comando SQL crea una tabla para guardar usuarios con un ID, un nombre de usuario (que debe ser único) y una contraseña.

        await db.execute (
         `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        `);
        console.log ("Tabla user lista para usar");
    }catch (error){
        console.error ("Error al configurar la base de datos", error);
    }
}

setupDatabase();

