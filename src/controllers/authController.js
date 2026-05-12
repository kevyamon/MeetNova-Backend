const Admin = require('../models/Admin');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

/**
 * Pourquoi : Gérer l'authentification admin avec une sécurité renforcée.
 * On vérifie l'email fourni et on le valide via le mot de passe maître (ADMIN_PWD).
 * Si le mail n'existe pas et le mot de passe est bon, on l'inscrit automatiquement.
 */

const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Veuillez fournir un email et un mot de passe');
    }

    // 1. Vérification contre le mot de passe maître (avec trim pour éviter les espaces invisibles)
    const masterPwd = process.env.ADMIN_PWD ? process.env.ADMIN_PWD.trim() : '';
    const inputPwd = password.trim();

    if (inputPwd !== masterPwd) {
      console.log(`[AUTH] Tentative échouée pour ${email}. Longueur saisie: ${inputPwd.length}, Longueur attendue: ${masterPwd.length}`);
      res.status(401);
      throw new Error('Mot de passe administrateur incorrect');
    }

    // 2. Recherche ou inscription automatique (Auto-Registration)
    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = await Admin.create({ email });
    }

    // 3. Génération des tokens
    const accessToken = generateToken(admin.email);
    const refreshToken = generateRefreshToken(admin.email);

    // 4. Stockage du Refresh Token dans un cookie sécurisé (httpOnly)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      success: true,
      accessToken,
      admin: { email: admin.email },
      message: 'Authentification réussie'
    });
  } catch (error) {
    next(error);
  }
};

// Route pour rafraîchir l'Access Token sans se reconnecter
const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) {
      res.status(401);
      throw new Error('Aucun token de rafraîchissement trouvé');
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Générer un nouvel Access Token
    const accessToken = generateToken(decoded.email);

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    res.status(401);
    next(new Error('Session expirée, veuillez vous reconnecter'));
  }
};

const logoutAdmin = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    expires: new Date(0),
    path: '/',
  });
  res.status(200).json({ message: 'Déconnexion réussie' });
};

module.exports = { loginAdmin, logoutAdmin, refreshAccessToken };
