const jwt = require('jsonwebtoken');

const JWT_SECRET = '$2a$10$uYO/xBNB4W6rds8Vt/YZ5uIGhIne57x3sQFArbqoHRTarbvJ1p7GG'; // En producción usa variables de entorno

const authenticateToken = (req, res, next) => {
  // Verificar cookie de sesión
  const sessionCookie = req.cookies.session;
  
  // Verificar header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Usar el token de la cookie o del header
  const authToken = sessionCookie || token;

  if (!authToken) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Se requiere autenticación' 
    });
  }

  jwt.verify(authToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Token inválido o expirado' 
      });
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, JWT_SECRET };