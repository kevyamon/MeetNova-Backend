const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  content: {
    type: String,
    required: [true, "Le corps de l'actualité est obligatoire"]
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'pdf'],
      default: 'image'
    },
    publicId: String // Pour Cloudinary si utilisé
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
