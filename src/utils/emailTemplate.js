/**
 * Pourquoi : Générer un email HTML professionnel directement dans le code 
 * permet un contrôle total sur le design et la colorimétrie (Rouge MeetNova).
 */

const generateTicketTemplate = (prenoms, nom, uuid) => {
  const primaryColor = '#FF1E1E'; // Rouge MeetNova
  const secondaryColor = '#111827'; // Noir MeetNova

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: ${secondaryColor}; padding: 30px; text-align: center; color: white; }
        .content { padding: 40px; text-align: center; }
        .qr-section { background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .button { background-color: ${primaryColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 20px; }
        h1 { margin: 0; font-size: 24px; }
        .uuid-text { font-family: monospace; color: ${primaryColor}; font-weight: bold; font-size: 14px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MEETNOVA</h1>
          <p>Conférence de Lancement</p>
        </div>
        <div class="content">
          <h2>Félicitations ${prenoms} !</h2>
          <p>Ton inscription à la conférence <strong>NovaTech Loko</strong> est confirmée.</p>
          
          <div class="qr-section">
            <p>Voici ton billet d'entrée (QR Code)</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${uuid}" alt="QR Code Billet" style="border: 5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <div class="uuid-text">ID: ${uuid}</div>
          </div>

          <p style="font-size: 14px; color: #666;">Veuillez présenter ce code QR à l'entrée le jour J.<br><strong>Conseil :</strong> Augmentez la luminosité de votre téléphone pour faciliter le scan.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 MeetNova. Tous droits réservés.</p>
          <p>Connecter - Collaborer - Innover</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateEventUpdateTemplate = (prenoms, eventTitle, eventDetails) => {
  const primaryColor = '#FF1E1E';
  const secondaryColor = '#111827';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: ${secondaryColor}; color: white; padding: 20px; text-align: center;">
          <h2>MISE À JOUR : ${eventTitle}</h2>
        </div>
        <div style="padding: 30px;">
          <p>Bonjour ${prenoms},</p>
          <p>Des modifications ont été apportées à l'événement <strong>${eventTitle}</strong> auquel vous êtes inscrit.</p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 5px solid ${primaryColor};">
            <p><strong>Nouveaux détails :</strong></p>
            <p>📍 Lieu : ${eventDetails.location}</p>
            <p>📅 Date : ${new Date(eventDetails.date).toLocaleDateString()}</p>
            <p>🕒 Heure : ${eventDetails.time}</p>
          </div>
          <p>Votre billet actuel reste valide. Nous avons hâte de vous y voir !</p>
        </div>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px;">
          &copy; 2026 MeetNova
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateEventCancellationTemplate = (prenoms, eventTitle) => {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
      <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: #FF1E1E; color: white; padding: 20px; text-align: center;">
          <h2>ANNULATION : ${eventTitle}</h2>
        </div>
        <div style="padding: 30px;">
          <p>Bonjour ${prenoms},</p>
          <p>Nous vous informons avec regret que l'événement <strong>${eventTitle}</strong> a été annulé ou supprimé.</p>
          <p>Nous nous excusons pour le désagrément causé.</p>
        </div>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px;">
          &copy; 2026 MeetNova
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateTicketTemplate, generateEventUpdateTemplate, generateEventCancellationTemplate };
