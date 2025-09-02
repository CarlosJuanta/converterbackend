const jwt = require ("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({message: "Acceso denegado. Se requiere autenticación. "});

    }

    try{
       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
       req.user = decoded;
       next();

    } catch(error){
        res.clearCookie("token");
        return res.status (401).json({message: "Token inválido o expirado inicie sesión nuevamente"});

    }
};

module.exports = authMiddleware;

