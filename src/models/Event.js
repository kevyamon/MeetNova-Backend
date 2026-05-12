const mongoose = require('mongoose');

/**
 * Pourquoi : Le modèle Event permet de gérer une multitude d'événements 
 * (Hackatons, Conférences, etc.) de manière dynamique. 
 * Les images sont stockées via Cloudinary (URLs).
 */
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre de l'événement est requis"],
    trim: true
  },
  type: {
    type: String,
    required: [true, "Le type d'événement est requis"],
    enum: ['Conférence', 'Hackaton', 'Sortie Détente', 'Formation', 'Autre']
  },
  date: {
    type: Date,
    required: [true, "La date de l'événement est requise"]
  },
  time: {
    type: String,
    required: [true, "L'heure de l'événement est requise"]
  },
  location: {
    type: String,
    required: [true, "Le lieu de l'événement est requis"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String // URLs Cloudinary
  }],
  status: {
    type: String,
    enum: ['Prévu', 'En cours', 'Terminé', 'Annulé'],
    default: 'Prévu'
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
