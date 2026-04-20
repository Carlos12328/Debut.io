const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set. Using insecure default. Set JWT_SECRET in production.');
}
const EFFECTIVE_SECRET = JWT_SECRET || 'debut_io_secret_key_change_in_production';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, EFFECTIVE_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = authMiddleware;
