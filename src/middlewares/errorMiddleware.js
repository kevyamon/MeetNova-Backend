/**
 * Pourquoi : Centraliser les erreurs permet de garantir qu'aucune information sensible 
 * (comme les stack traces) ne fuit en production, tout en offrant des logs utiles en développement.
 */

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  const response = {
    message: err.message,
    // On n'affiche la stack trace qu'en mode développement
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  // Log de l'erreur pour le serveur
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);

  res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
