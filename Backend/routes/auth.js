const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Simulación de base de datos de usuarios
const users = [
  {
    id: 1,
    email: 'rodolfo@email.com',
    // Password: "rodo" hasheado
    password: '$2a$10$uYO/xBNB4W6rds8Vt/YZ5uIGhIne57x3sQFArbqoHRTarbvJ1p7GG'
  }
];

// Endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Configurar cookie
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax',
      maxAge: 3600 * 1000 // 1 hora en milisegundos
    });

    // Responder con token en el body
    res.json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error del servidor'
    });
  }
});

// Endpoint de logout
router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;