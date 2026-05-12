const { z } = require('zod');

/**
 * Pourquoi : La validation par schéma (Zod) côté backend est notre première ligne de défense.
 * Elle rejette tout champ inattendu (strict) et garantit que les données respectent le format attendu
 * avant même d'atteindre la base de données.
 */

const registrationSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').trim(),
  prenoms: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').trim(),
  email: z.string().email('Format d\'email invalide').trim().toLowerCase(),
  campus: z.string().min(1, 'Le campus est requis').regex(/^[A-Z0-9\s]+$/, 'Le campus doit être en majuscules').trim(),
  niveau_etude: z.string({ required_error: 'Le niveau d\'étude est requis' }),
  filiere: z.string().min(1, 'La filière est requise').regex(/^[A-Z]+$/, 'La filière doit être en majuscules et ne contenir que des lettres').trim(),
  event: z.string({ required_error: 'L\'ID de l\'événement est requis' }),
}).strict(); // Rejette tout champ non défini dans le schéma

module.exports = { registrationSchema };
