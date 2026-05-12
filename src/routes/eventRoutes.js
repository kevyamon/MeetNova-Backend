const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

/**
 * Pourquoi : Exposer les routes de gestion des événements. 
 * Les routes de création, modification et suppression sont protégées par AuthAdmin 
 * et gèrent l'upload d'images via Cloudinary.
 */

// Route publique : Liste des événements pour le feed
router.get('/', getEvents);

// Routes protégées Admin
router.use(protectAdmin);

// POST /api/events - Créer un événement (jusqu'à 5 images)
router.post('/', upload.array('images', 5), createEvent);

// PUT /api/events/:id - Modifier un événement
router.put('/:id', upload.array('images', 5), updateEvent);

// DELETE /api/events/:id - Supprimer un événement
router.delete('/:id', deleteEvent);

module.exports = router;
