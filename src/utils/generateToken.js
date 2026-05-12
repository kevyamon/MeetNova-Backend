const jwt = require('jsonwebtoken');

/**
 * Pourquoi : Isoler la génération de tokens permet de maintenir une logique cohérente 
 * pour l'Access Token et le Refresh Token. On utilise des secrets différents pour plus de sécurité.
 */

const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Access Token court (15 min)
  });
};

const generateRefreshToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Refresh Token long (7 jours)
  });
};

module.exports = { generateToken, generateRefreshToken };
