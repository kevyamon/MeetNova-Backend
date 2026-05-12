const express = require('express');
const router = express.Router();
const { validateScan, getDashboardStats, getAttendeesList } = require('../controllers/scanController');
const { protectAdmin } = require('../middlewares/authMiddleware');

/**
 * Pourquoi : Toutes les routes liées au scan et au dashboard sont protégées.
 * Seul un administrateur authentifié peut y accéder.
 */

// Appliquer la protection sur toutes les routes de ce fichier
router.use(protectAdmin);

// PUT /api/scan/validate/:uuid
router.put('/validate/:uuid', validateScan);

// GET /api/scan/stats
router.get('/stats', getDashboardStats);

// GET /api/scan/list
router.get('/list', getAttendeesList);

module.exports = router;
