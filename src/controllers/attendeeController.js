const { v4: uuidv4 } = require('uuid');
const Attendee = require('../models/Attendee');
const { registrationSchema } = require('../validations/attendeeValidation');
const { sendTicketEmail } = require('../services/emailService');

/**
 * Pourquoi : Le contrôleur orchestre la requête. Il valide les données, 
 * appelle les services nécessaires et renvoie la réponse. 
 * Il ne contient pas de logique métier complexe (déléguée aux services si besoin).
 */

const registerAttendee = async (req, res, next) => {
  try {
    // 1. Validation des données entrantes
    const validatedData = registrationSchema.parse(req.body);

    // 2. Vérification de l'existence de l'email (Éviter les doublons)
    const existingAttendee = await Attendee.findOne({ email: validatedData.email }).lean();
    if (existingAttendee) {
      res.status(400);
      throw new Error('Cet email est déjà utilisé pour une inscription.');
    }

    // 3. Création de l'UUID unique
    const uuid = uuidv4();

    // 4. Enregistrement en base de données
    const newAttendee = await Attendee.create({
      ...validatedData,
      uuid
    });

    // 5. Envoi de l'email transactionnel (via Service)
    // Note: On peut décider de ne pas attendre (await) si on veut une réponse ultra rapide,
    // mais ici on veut être sûr que l'email est envoyé ou au moins loggé comme erreur.
    try {
      await sendTicketEmail(newAttendee);
    } catch (emailError) {
      // On continue l'exécution, l'utilisateur est inscrit même si l'email a échoué
      console.error("Email non envoyé, mais inscription réussie.");
    }

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
