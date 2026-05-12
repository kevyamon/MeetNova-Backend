require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketConfig = require('./config/socket');
const validateEnv = require('./config/env');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Validation des variables d'environnement avant tout
validateEnv();

// Connexion à la base de données
connectDB();

const app = express();
const server = http.createServer(app);

// Initialisation de Socket.io
socketConfig.init(server);

app.use(helmet()); // Protection des headers HTTP

// Configuration CORS dynamique
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origine (comme Postman ou serveurs mobiles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important pour les cookies httpOnly
}));
app.use(express.json()); // Parsing JSON avec limite de taille
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parsing des cookies pour le Refresh Token
app.use(morgan('dev')); // Logging des requêtes HTTP

// Route de base pour vérification de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MeetNova API is running' });
});

// Routes API
app.use('/api/attendees', require('./routes/attendeeRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
