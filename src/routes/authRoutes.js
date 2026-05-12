const express = require('express');
const router = express.Router();
const { loginAdmin, logoutAdmin, refreshAccessToken } = require('../controllers/authController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.body.email || req.ip,
  message: {
    message: "Trop de tentatives de connexion pour ce compte, réessayez dans une heure."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/refresh', (req, res, next) => {
  req.cookies = req.headers.cookie ? require('cookie').parse(req.headers.cookie) : {};
  refreshAccessToken(req, res, next);
});

router.get('/status', protectAdmin, (req, res) => {
  res.status(200).json({ status: 'Authenticated', email: req.adminEmail });
});

router.post('/login', loginLimiter, loginAdmin);

router.post('/logout', logoutAdmin);

module.exports = router;
