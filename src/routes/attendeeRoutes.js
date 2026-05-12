const express = require('express');
const router = express.Router();
const { registerAttendee } = require('../controllers/attendeeController');
const rateLimit = require('express-rate-limit');

/**
 * Pourquoi : Exposer les routes de manière modulaire. 
 * On applique un rate limit spécifique à l'inscription pour éviter le spam.
 */

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 inscriptions par IP par fenêtre
  message: {
    message: "Trop de tentatives d'inscription depuis cette adresse IP, réessayez plus tard."
  }
});

// POST /api/attendees/register
router.post('/register', registerLimiter, registerAttendee);

module.exports = router;
