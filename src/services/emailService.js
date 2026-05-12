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
  secure: false,
  auth: {
    user: 'xkeysib',
    pass: process.env.BREVO_API_KEY
  }
});

// Vérification de la configuration SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error("Erreur de configuration SMTP (Brevo) :", error.message);
  } else {
    console.log("Serveur SMTP Brevo prêt à envoyer des emails.");
  }
});

const sendTicketEmail = async (attendee) => {
  const { email, nom, prenoms, uuid } = attendee;
  console.log(`Tentative d'envoi de billet à : ${email}...`);

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: "MeetNova - Votre billet d'entrée est arrivé !",
      html: generateTicketTemplate(prenoms, nom, uuid)
    });
    console.log(`Email envoyé avec succès à ${email}. MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`ÉCHEC envoi email à ${email}:`, error.message);
    throw error;
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
