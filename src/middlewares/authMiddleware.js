const jwt = require('jsonwebtoken');

/**
 * Pourquoi : Le middleware de protection garantit que seules les requêtes 
 * avec un token valide peuvent accéder aux routes sensibles (Scan, Dashboard).
 */

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // On attache l'email admin à la requête (pas besoin de chercher en DB si on fait confiance au JWT)
      req.adminEmail = decoded.email;

      next();
    } catch (error) {
      console.error('Erreur Token:', error.message);
      res.status(401);
      throw new Error('Non autorisé, token invalide');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Non autorisé, aucun token fourni');
  }
};

module.exports = { protectAdmin };
