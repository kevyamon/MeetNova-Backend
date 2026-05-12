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

// Configuration CORS dynamique (uniquement via variables d'environnement)
const allowedOrigins = ['http://localhost:5173'];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
    const trimmedOrigin = origin.trim();
    if (trimmedOrigin && !allowedOrigins.includes(trimmedOrigin)) {
      allowedOrigins.push(trimmedOrigin);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`[CORS] Origine bloquée : ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));
app.use(express.json()); // Parsing JSON avec limite de taille
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parsing des cookies pour le Refresh Token
app.use(morgan('dev')); // Logging des requêtes HTTP

// Route racine : répond aux health checks de Render (HEAD /)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', name: 'MeetNova API', version: '1.0.0' });
});

// Route de santé détaillée
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MeetNova API is running' });
});

// Routes API
app.use('/api/attendees', require('./routes/attendeeRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
