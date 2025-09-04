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
        return res.status (409).json ({message: "El nombre del usuario ya existe"});
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
        const { username, password } = req.body;

        const result = await db.execute({
            sql: "SELECT * FROM users WHERE username = ?",
            args: [username]
        });

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Credenciales inválidas." });
        }
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas." });
        }

        const payload = { id: user.id, username: user.username };

        // ===================================================================
        // ===== INICIO DE LA MODIFICACIÓN =====
        // ===================================================================
        const expiresInSeconds = 3 * 60; // 3 minutos en segundos
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: expiresInSeconds
        });

        // Calculamos el timestamp de expiración en MILISEGUNDOS (importante para JavaScript)
        const expirationTime = Date.now() + (expiresInSeconds * 1000);
        // ===================================================================
        // ===== FIN DE LA MODIFICACIÓN =====
        // ===================================================================

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // ¡Aquí enviamos la respuesta JSON que el frontend espera!
        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            expiresAt: expirationTime // <-- ¡La pieza que faltaba!
        });

    } catch (error) {
        console.error("Error en el login ", error);
        res.status(500).json({ message: "Error en el servidor al iniciar sesión." });
    }
};

// FUNCIÓN PARA VERIFICAR EL TOKEN ACTUAL
const verifyToken = (req, res) => {
  // Si el middleware 'authMiddleware' nos dejó pasar, significa que el token es válido.
  // La información del usuario ya fue añadida a 'req.user' por el middleware.
  res.status(200).json({ 
    message: "Token válido.", 
    user: req.user 
  });
};
 

//FUNCIÓN PARA CERRAR SESIÓN 
const logout = (req, res) => {
    res.clearCookie ('token');
    res.status(200).json({message: "Sesión cerrada exitosamente. "});
};



//RENOVACIÓN DE TOKEN 

// FUNCIÓN PARA RENOVAR EL TOKEN (REFRESH)
const refreshToken = (req, res) => {
  // Si el middleware 'authMiddleware' nos dejó pasar, significa que el token actual es válido.
  // La información del usuario está en 'req.user'.
  
  // 1. Creamos un payload exactamente igual al del login.
  const payload = { id: req.user.id, username: req.user.username };

  // 2. Creamos un token NUEVO con una nueva fecha de expiración de 3 minutos.
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: '3m'
  });

  // 3. Enviamos el nuevo token en la cookie, reemplazando al antiguo.
  res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
  });

  res.status(200).json({ message: "Token renovado exitosamente." });
};

module.exports = {
    register,
    login,
    verifyToken,
    logout,
    refreshToken
};