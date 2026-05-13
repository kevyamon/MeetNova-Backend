const { generateTicketTemplate, generateEventUpdateTemplate, generateEventCancellationTemplate } = require('../utils/emailTemplate');
const axios = require('axios');

/**
 * Pourquoi : Contournement Pare-feu Cloud (comme sur Yely)
 * Le port SMTP 587 est souvent bloqué. On utilise directement l'API REST de Brevo via HTTPS.
 * STRICTE RÉPLICATION DE YELY UTILISANT AXIOS.
 */

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          email: process.env.BREVO_SENDER_EMAIL || "noreply@meetnova.com", 
          name: process.env.BREVO_SENDER_NAME || "MeetNova" 
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[EMAIL ERROR] Echec d'envoi API HTTP à ${toEmail} :`, errorDetails);
    throw new Error("Impossible d'envoyer l'email.");
  }
};

const sendTicketEmail = async (attendee, eventInfo) => {
  const { email, nom, prenoms, uuid } = attendee;
  console.log(`Tentative d'envoi de billet à : ${email}...`);

  try {
    const html = generateTicketTemplate(prenoms, nom, uuid, eventInfo);
    await sendBrevoEmail(email, "MeetNova - Votre billet d'entrée est arrivé !", html);
    console.log(`Email envoyé avec succès à ${email}.`);
  } catch (error) {
    console.error(`ÉCHEC envoi email à ${email}:`, error.message);
    throw error;
  }
};

const sendEventUpdateEmail = async (email, prenoms, eventTitle, eventDetails) => {
  try {
    const html = generateEventUpdateTemplate(prenoms, eventTitle, eventDetails);
    await sendBrevoEmail(email, `Mise à jour de l'événement : ${eventTitle}`, html);
  } catch (error) {
    console.error(`Erreur envoi email mise à jour à ${email}:`, error.message);
  }
};

const sendEventCancellationEmail = async (email, prenoms, eventTitle) => {
  try {
    const html = generateEventCancellationTemplate(prenoms, eventTitle);
    await sendBrevoEmail(email, `Annulation de l'événement : ${eventTitle}`, html);
  } catch (error) {
    console.error(`Erreur envoi email annulation à ${email}:`, error.message);
  }
};

module.exports = { sendTicketEmail, sendEventUpdateEmail, sendEventCancellationEmail };
