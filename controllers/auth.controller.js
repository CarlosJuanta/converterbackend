const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const db = require ('../database/connection') //importar la conexión a la bd

const register  = async (req, res) => {
  // ===================================================================
// FUNCIÓN PARA REGISTRAR UN NUEVO USUARIO
// ================
  try {
    //obtener usuario y contraseña  
    const {username, password} = req.body;
     
    //verificar que no vengan vaciaso

    if (!username  || !password) {
        return res.status(400).json({ message: "usuario y contraseña son requeridos."});
    }

    //encriptar la contraseña para gurardarla

    const salt= await bcrypt.genSalt (10);
    const hashedPassword = await bcrypt.hash(password, salt);


    //guardar el nuevo usuario en la base de datos turso

    await db.execute ({
        sql: "INSERT INTO users (username, password) VALUES (?,?)",
        args: [username, hashedPassword]  //se guarda la contraeña encriptada
    });

    // se enviar mensaje de respuesta de éxito 

    res.status (201).json ({message: "usuario registrado exitosamente"});

} catch (error) {
    if (error.message && error.message.includes ("UNIQUE constraint failed")) {
        return res.status (409).json ({message: "El nobre del susuario ya existe"});
    }
    //para cualquier otro caso
    console.error ("Erros en el registro: ", error);
    res.status(500).json({message: "Error en el servidor al registrar el usuario"});
}
};


// ===================================================================
// FUNCIÓN PARA INICIAR SESIÓN
// ===================================================================
const login = async (req, res) => {
   try {

    //obtener usuario y contraseña

    const {username, password} = req.body;

     //buscar al usario en la base de datos 
     const result = await db.execute ({
        sql: "SELECT * FROM users WHERE username= ?",
        args: [username]
     });


     //si no se encuentra al usuario las credenciales son incorrectas 
     if (result.rows.length === 0) {
        return res.status(400).json ({message: "credenciales inválidadas."});
     }
     const user = result.rows[0];


    //comparar la contraseña enviada con la que está guardada  y encriptada en la BD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
        return res.status (400).json ({message: "credenciales inválidas"});
    }

    // si todo es correcto
    const payload = {id: user.id, username: user.username};
    const token= jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: '3m'
    });

    //se envia el token al cliente dentro de una cooke segura

    res.cookie ('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json ({message: "Inicio de sesión exitoso. " });

    } catch (error) {
        console.error ("Error en el login ", error);
        res.status (500).json({message: "Error en el servidor al iniciar sesión.  "});

    }
};

module.exports = {
    register,
    login
};