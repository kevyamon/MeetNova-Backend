const { generateTicketTemplate, generateEventUpdateTemplate, generateEventCancellationTemplate } = require('../utils/emailTemplate');

/**
 * Pourquoi : Contournement Pare-feu Cloud (comme sur Yely)
 * Le port SMTP 587 est souvent bloqué. On utilise directement l'API REST de Brevo via HTTPS.
 */

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          email: process.env.BREVO_SENDER_EMAIL, 
          name: process.env.BREVO_SENDER_NAME || "MeetNova" 
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[EMAIL ERROR] Echec d'envoi API HTTP à ${toEmail}:`, error.message);
    throw error;
  }
};

const sendTicketEmail = async (attendee) => {
  const { email, nom, prenoms, uuid } = attendee;
  console.log(`Tentative d'envoi de billet à : ${email}...`);

  try {
    const html = generateTicketTemplate(prenoms, nom, uuid);
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
