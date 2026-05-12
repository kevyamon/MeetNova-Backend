const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin, refreshAccessToken } = require('../controllers/authController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

/**
 * Pourquoi : Sécuriser la route d'authentification admin avec un rate limiter 
 * strict pour prévenir les attaques par force brute.
 */

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 30, // 30 tentatives max
  keyGenerator: (req) => req.body.email || req.ip, // Bloque par email, sinon par IP en dernier recours
  message: {
    message: "Trop de tentatives de connexion pour ce compte, réessayez dans une heure."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/auth/status - Pour vérifier si la session est toujours valide
router.get('/status', protectAdmin, (req, res) => {
  res.status(200).json({ status: 'Authenticated', email: req.adminEmail });
});

// GET /api/auth/refresh - Pour renouveler l'access token
router.get('/refresh', refreshAccessToken);

// POST /api/auth/login
router.post('/login', loginLimiter, loginAdmin);

// POST /api/auth/logout
router.post('/logout', logoutAdmin);

module.exports = router;
