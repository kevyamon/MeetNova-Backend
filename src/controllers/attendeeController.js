const { v4: uuidv4 } = require('uuid');
const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const { registrationSchema } = require('../validations/attendeeValidation');
const { sendTicketEmail } = require('../services/emailService');

/**
 * Pourquoi : Le contrôleur orchestre la requête. Il valide les données, 
 * appelle les services nécessaires et renvoie la réponse.
 * La vérification d'existence est désormais scopée à l'événement spécifique.
 */

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

    // 3. Création de l'UUID unique
    const uuid = uuidv4();

    // 4. Récupération des infos de l'événement pour calculer la date d'expiration
    const eventInfo = await Event.findById(validatedData.event).lean();
    
    // Calcul de l'expiration : 3 jours après la date de l'événement
    let expireAtDate = new Date();
    if (eventInfo && eventInfo.date) {
      expireAtDate = new Date(eventInfo.date);
    }
    expireAtDate.setDate(expireAtDate.getDate() + 3); // Ajoute 3 jours

    // 5. Enregistrement en base de données avec expireAt
    const newAttendee = await Attendee.create({
      ...validatedData,
      uuid,
      expireAt: expireAtDate
    });

    // 6. Envoi de l'email transactionnel en arrière-plan (non-bloquant)
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
    // Si c'est une erreur de validation Zod, on formate le message
    if (error.errors) {
      res.status(400);
      return next(new Error(error.errors.map(e => e.message).join(', ')));
    }
    next(error);
  }
};

module.exports = { registerAttendee };
