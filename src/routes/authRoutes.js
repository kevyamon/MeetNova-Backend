const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

/**
 * Pourquoi : Sécuriser la route d'authentification admin avec un rate limiter 
 * strict pour prévenir les attaques par force brute.
 */

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 tentatives max par IP
  message: {
    message: "Trop de tentatives de connexion, réessayez dans une heure."
  }
});

// GET /api/auth/status - Pour vérifier si la session est toujours valide
router.get('/status', protect, (req, res) => {
  res.status(200).json({ status: 'Authenticated' });
});

// POST /api/auth/login
router.post('/login', loginLimiter, loginAdmin);

// POST /api/auth/logout
router.post('/logout', logoutAdmin);

module.exports = router;
