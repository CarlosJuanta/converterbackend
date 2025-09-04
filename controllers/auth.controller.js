// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const register = async (req, res) => {
    // ... (Tu función de registro está perfecta, no necesita cambios) ...
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "usuario y contraseña son requeridos." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.execute({
            sql: "INSERT INTO users (username, password) VALUES (?,?)",
            args: [username, hashedPassword]
        });
        res.status(201).json({ message: "usuario registrado exitosamente" });
    } catch (error) {
        if (error.message && error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ message: "El nombre del usuario ya existe" });
        }
        console.error("Erros en el registro: ", error);
        res.status(500).json({ message: "Error en el servidor al registrar el usuario" });
    }
};

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
        const expiresInSeconds = 3 * 60;
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: expiresInSeconds
        });
        const expirationTime = Date.now() + (expiresInSeconds * 1000);

        // ===================================================================
        // ===== CAMBIO #1: AQUÍ =====
        // ===================================================================
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,       // Forzar HTTPS, crucial para producción
            sameSite: 'None',   // Permite que la cookie se envíe entre dominios diferentes
            path: '/',          // Asegura que la cookie esté disponible en todas las rutas
        });
        // ===================================================================

        res.status(200).json({
            message: "Inicio de sesión exitoso.",
            expiresAt: expirationTime
        });

    } catch (error) {
        console.error("Error en el login ", error);
        res.status(500).json({ message: "Error en el servidor al iniciar sesión." });
    }
};

const verifyToken = (req, res) => {
    res.status(200).json({
        message: "Token válido.",
        user: req.user
    });
};

const logout = (req, res) => {
    // ===================================================================
    // ===== CAMBIO #2: AQUÍ =====
    // ===================================================================
    // Para que el borrado funcione entre dominios, debe tener las mismas propiedades
    // que usamos al crear la cookie.
    res.clearCookie('token', {
        secure: true,
        sameSite: 'None',
        path: '/',
    });
    // ===================================================================
    res.status(200).json({ message: "Sesión cerrada exitosamente." });
};

const refreshToken = (req, res) => {
    const payload = { id: req.user.id, username: req.user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: '3m'
    });
    
    // Tu función refreshToken ya estaba correcta, la dejamos como está.
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
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