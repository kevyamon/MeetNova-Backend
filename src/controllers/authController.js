const { generateToken, generateRefreshToken } = require('../utils/generateToken');

/**
 * Pourquoi : Gérer l'authentification admin avec une sécurité renforcée.
 * Le mot de passe admin est vérifié contre une variable d'environnement (ADMIN_PWD).
 * On utilise des cookies httpOnly pour le Refresh Token afin de prévenir les attaques XSS.
 */

const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Vérification simple : Email fourni et password correspond à l'ADMIN_PWD
    // (Dans un système plus complexe, on chercherait l'admin en DB)
    if (password === process.env.ADMIN_PWD) {
      
      const accessToken = generateToken(email);
      const refreshToken = generateRefreshToken(email);

      // 2. Stockage du Refresh Token dans un cookie sécurisé (httpOnly)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS en prod
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.status(200).json({
        success: true,
        accessToken,
        message: 'Authentification réussie'
      });
    } else {
      res.status(401);
      throw new Error('Email ou mot de passe incorrect');
    }
  } catch (error) {
    next(error);
  }
};

const logoutAdmin = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Déconnexion réussie' });
};

module.exports = { loginAdmin, logoutAdmin };
