const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

/**
 * Pourquoi : multer-storage-cloudinary@4 exige cloudinary v1 (vulnérable).
 * On écrit notre propre storage Multer qui utilise cloudinary v2 directement,
 * via upload_stream. Cela supprime la dépendance vulnérable et nous donne 
 * un contrôle total sur le pipeline d'upload.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Storage personnalisé : Multer en mémoire, puis on streame vers Cloudinary v2
const memoryStorage = multer.memoryStorage();

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Multer : stockage en mémoire, limite 20 Mo par fichier
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non autorisé. Utilisez JPG, PNG ou WebP.'));
    }
  }
});

module.exports = { cloudinary, upload, uploadToCloudinary };
