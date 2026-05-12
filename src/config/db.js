const mongoose = require('mongoose');

/**
 * Pourquoi : Centraliser la connexion à la base de données permet une gestion 
 * propre des erreurs au démarrage et une réutilisation facile de la connexion.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
