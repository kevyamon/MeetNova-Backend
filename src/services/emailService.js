const nodemailer = require('nodemailer');
const { generateTicketTemplate, generateEventUpdateTemplate, generateEventCancellationTemplate } = require('../utils/emailTemplate');

/**
 * Pourquoi : Nodemailer via SMTP Brevo est la solution la plus stable et éprouvée.
 * Aucun SDK propriétaire, aucun risque de casse d'API. Brevo fournit un accès SMTP
 * avec la clé API comme mot de passe.
 */

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // TLS STARTTLS
  auth: {
    user: process.env.BREVO_SENDER_EMAIL, // L'email expéditeur Brevo
    pass: process.env.BREVO_API_KEY       // La clé API Brevo sert de mot de passe SMTP
  }
});

const sendTicketEmail = async (attendee) => {
  const { email, nom, prenoms, uuid } = attendee;

  try {
    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: "MeetNova - Votre billet d'entrée est arrivé !",
      html: generateTicketTemplate(prenoms, nom, uuid)
    });
  } catch (error) {
    console.error(`Erreur envoi email billet à ${email}:`, error.message);
    // Non-bloquant : l'inscription reste valide même si l'email échoue
    throw new Error("Erreur lors de l'envoi de l'email de confirmation");
  }
};

const sendEventUpdateEmail = async (email, prenoms, eventTitle, eventDetails) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: `Mise à jour de l'événement : ${eventTitle}`,
      html: generateEventUpdateTemplate(prenoms, eventTitle, eventDetails)
    });
  } catch (error) {
    console.error(`Erreur envoi email mise à jour à ${email}:`, error.message);
  }
};

const sendEventCancellationEmail = async (email, prenoms, eventTitle) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: `Annulation de l'événement : ${eventTitle}`,
      html: generateEventCancellationTemplate(prenoms, eventTitle)
    });
  } catch (error) {
    console.error(`Erreur envoi email annulation à ${email}:`, error.message);
  }
};

module.exports = { sendTicketEmail, sendEventUpdateEmail, sendEventCancellationEmail };
