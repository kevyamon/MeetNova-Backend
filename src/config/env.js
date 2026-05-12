/**
 * Pourquoi : Sécuriser le démarrage du serveur en s'assurant que toutes 
 * les variables d'environnement critiques sont présentes et non vides.
 * Cela évite des erreurs "silent" en production qui seraient difficiles à débugger.
 */

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ADMIN_PWD',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ALLOWED_ORIGINS'
];

const validateEnv = () => {
  const missingVars = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ ERREUR CRITIQUE : Variables d\'environnement manquantes ou vides :');
    missingVars.forEach((v) => console.error(`   - ${v}`));
    console.error('\nLe serveur ne peut pas démarrer sans ces configurations.');
    process.exit(1);
  }

  console.log('✅ Configuration environnement validée.');
};

module.exports = validateEnv;
