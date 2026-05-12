let io;

/**
 * Pourquoi : Centraliser l'instance Socket.io permet de l'utiliser 
 * dans n'importe quel contrôleur (pour envoyer des notifications en temps réel).
 */

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Nouvelle connexion : ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`[SOCKET] Déconnexion : ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io n'est pas initialisé !");
    }
    return io;
  }
};
