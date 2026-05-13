const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const { registrationSchema } = require('../validations/attendeeValidation');
const { sendTicketEmail } = require('../services/emailService');

/**
 * Utilitaire pour générer un ID de ticket stylisé et professionnel.
 * Format : [2 lettres titre][Jour][1 lettre Lieu]-[Année]-[4 Alphanum Aléatoires]
 * Exemple : CO31G-2026-X8R2
 */
const generateTicketID = (eventInfo) => {
  // Nettoyage pour ne garder que les lettres et chiffres
  const cleanTitle = (eventInfo.title || 'EV').replace(/[^a-zA-Z0-9]/g, '');
  const cleanLoc = (eventInfo.location || 'L').replace(/[^a-zA-Z0-9]/g, '');
  
  const prefix = cleanTitle.substring(0, 2).toUpperCase().padEnd(2, 'X');
  const eventDate = new Date(eventInfo.date);
  const day = eventDate.getDate().toString().padStart(2, '0');
  const loc = cleanLoc.substring(0, 1).toUpperCase() || 'X';
  const year = eventDate.getFullYear();
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
                     
  return `${prefix}${day}${loc}-${year}-${randomPart}`;
};

const registerAttendee = async (req, res, next) => {
  try {
    // 1. Validation des données entrantes
    const validatedData = registrationSchema.parse(req.body);

    // 2. Vérification de l'existence de l'email pour CET événement précis
    const existingAttendee = await Attendee.findOne({ 
      email: validatedData.email, 
      event: validatedData.event 
    }).lean();

    if (existingAttendee) {
      res.status(400);
      throw new Error('Cet email est déjà inscrit à cet événement.');
    }

    // 3. Récupération des infos de l'événement (nécessaire pour le Ticket ID et l'expiration)
    const eventInfo = await Event.findById(validatedData.event).lean();
    if (!eventInfo) {
      res.status(404);
      throw new Error('Événement introuvable');
    }

    // 4. Génération de l'ID Unique Stylisé (avec boucle de sécurité contre les collisions)
    let uuid;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      uuid = generateTicketID(eventInfo);
      const collision = await Attendee.findOne({ uuid }).lean();
      if (!collision) {
        isUnique = true;
      }
      attempts++;
    }

    // 5. Calcul de l'expiration : 3 jours après la date de l'événement
    let expireAtDate = new Date();
    if (eventInfo.date) {
      expireAtDate = new Date(eventInfo.date);
    }
    expireAtDate.setDate(expireAtDate.getDate() + 3);

    // 6. Enregistrement en base de données
    const newAttendee = await Attendee.create({
      ...validatedData,
      uuid,
      expireAt: expireAtDate
    });

    // 7. Envoi de l'email transactionnel en arrière-plan
    sendTicketEmail(newAttendee, eventInfo).catch(emailError => {
      console.error(`Email non envoyé à ${newAttendee.email}:`, emailError.message);
    });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Votre billet a été envoyé par e-mail.',
      data: {
        uuid: newAttendee.uuid
      }
    });

  } catch (error) {
    if (error.errors) {
      res.status(400);
      return next(new Error(error.errors.map(e => e.message).join(', ')));
    }
    next(error);
  }
};

module.exports = { registerAttendee };
