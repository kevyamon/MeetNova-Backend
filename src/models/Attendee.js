const mongoose = require('mongoose');

/**
 * Pourquoi : Le modèle Attendee centralise toutes les informations des participants.
 * L'utilisation d'un index unique sur l'email et l'UUID garantit l'intégrité des données.
 */
const attendeeSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, "L'événement est requis"]
  },
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenoms: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  campus: {
    type: String,
    required: [true, 'Le campus est requis'],
    trim: true
  },
  niveau_etude: {
    type: String,
    required: [true, "Le niveau d'étude est requis"],
    enum: ['BTS1', 'BTS2', 'Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']
  },
  filiere: {
    type: String,
    required: [true, 'La filière est requise'],
    trim: true
  },
  isPresent: {
    type: Boolean,
    default: false
  },
  scannedAt: {
    type: Date,
    default: null
  },
  expireAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index TTL : MongoDB supprimera automatiquement le document à la date exacte stockée dans `expireAt`
// (qui sera calculée à la création comme étant : Date de l'événement + 3 jours)
attendeeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Transformation pour le retour JSON (sécurité : on ne renvoie pas le _id interne si non nécessaire)
attendeeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Attendee = mongoose.model('Attendee', attendeeSchema);

module.exports = Attendee;
