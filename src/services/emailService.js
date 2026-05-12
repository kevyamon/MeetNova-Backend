const { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } = require('@getbrevo/brevo');

/**
 * Pourquoi : Isoler l'envoi d'emails dans un service dédié permet de changer 
 * de fournisseur facilement. On utilise @getbrevo/brevo car sib-api-v3-sdk est déprécié.
 */

const { generateTicketTemplate, generateEventUpdateTemplate, generateEventCancellationTemplate } = require('../utils/emailTemplate');

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendTicketEmail = async (attendee) => {
  const { email, nom, prenoms, uuid } = attendee;

  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.subject = "MeetNova - Votre billet d'entrée est arrivé !";
  sendSmtpEmail.to = [{ email, name: `${prenoms} ${nom}` }];
  sendSmtpEmail.sender = { 
    email: process.env.BREVO_SENDER_EMAIL, 
    name: process.env.BREVO_SENDER_NAME 
  };
  
  // Utilisation de notre template HTML personnalisé
  sendSmtpEmail.htmlContent = generateTicketTemplate(prenoms, nom, uuid);

  try {
    return await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw new Error("Erreur lors de l'envoi de l'email de confirmation");
  }
};

const sendEventUpdateEmail = async (email, prenoms, eventTitle, eventDetails) => {
  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.subject = `Mise à jour : ${eventTitle}`;
  sendSmtpEmail.to = [{ email, name: prenoms }];
  sendSmtpEmail.sender = { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME };
  sendSmtpEmail.htmlContent = generateEventUpdateTemplate(prenoms, eventTitle, eventDetails);

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(`Error sending update email to ${email}:`, error);
  }
};

const sendEventCancellationEmail = async (email, prenoms, eventTitle) => {
  const sendSmtpEmail = new SendSmtpEmail();
  sendSmtpEmail.subject = `Annulation : ${eventTitle}`;
  sendSmtpEmail.to = [{ email, name: prenoms }];
  sendSmtpEmail.sender = { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME };
  sendSmtpEmail.htmlContent = generateEventCancellationTemplate(prenoms, eventTitle);

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(`Error sending cancellation email to ${email}:`, error);
  }
};

module.exports = { sendTicketEmail, sendEventUpdateEmail, sendEventCancellationEmail };
