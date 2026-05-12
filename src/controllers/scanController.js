const Attendee = require('../models/Attendee');

/**
 * Pourquoi : Gérer la validation des entrées le jour J et fournir des 
 * statistiques en temps réel pour le dashboard.
 */

// Valider un scan (PUT /api/scan/:uuid)
const validateScan = async (req, res, next) => {
  const { uuid } = req.params;

  try {
    const attendee = await Attendee.findOne({ uuid });

    if (!attendee) {
      res.status(404);
      throw new Error('⚠️ CODE INVALIDE OU FALSIFIÉ');
    }

    if (attendee.isPresent) {
      res.status(400).json({
        success: false,
        message: '❌ BILLET DÉJÀ SCANNÉ',
        scannedAt: attendee.scannedAt,
        nom: attendee.nom,
        prenoms: attendee.prenoms
      });
      return;
    }

    // Mise à jour du statut
    attendee.isPresent = true;
    attendee.scannedAt = new Date();
    await attendee.save();

    res.status(200).json({
      success: true,
      message: '✅ ACCÈS AUTORISÉ',
      data: {
        nom: attendee.nom,
        prenoms: attendee.prenoms,
        campus: attendee.campus
      }
    });

  } catch (error) {
    next(error);
  }
};

// Obtenir les statistiques du Dashboard (GET /api/scan/stats)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalInscrits = await Attendee.countDocuments();
    const totalPresents = await Attendee.countDocuments({ isPresent: true });

    // Répartition par campus
    const campusStats = await Attendee.aggregate([
      { $group: { _id: '$campus', count: { $sum: 1 } } }
    ]);

    // Répartition par niveau
    const niveauStats = await Attendee.aggregate([
      { $group: { _id: '$niveau_etude', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalInscrits,
        totalPresents,
        tauxParticipation: totalInscrits > 0 ? (totalPresents / totalInscrits) * 100 : 0,
        campusStats,
        niveauStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Liste des participants avec recherche (GET /api/scan/list)
const getAttendeesList = async (req, res, next) => {
  const { search } = req.query;
  const query = search ? {
    $or: [
      { nom: { $regex: search, $options: 'i' } },
      { prenoms: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  } : {};

  try {
    const attendees = await Attendee.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: attendees
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { validateScan, getDashboardStats, getAttendeesList };
