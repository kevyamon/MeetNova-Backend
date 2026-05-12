const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const socket = require('../config/socket');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendEventUpdateEmail, sendEventCancellationEmail } = require('../services/emailService');

/**
 * Pourquoi : Gérer les événements en temps réel. Chaque action (création, modification, 
 * suppression) déclenche un événement Socket.io pour mettre à jour le feed client instantanément.
 */

// Utilitaire pour notifier les inscrits par email
const notifyParticipants = async (eventId, type, eventData) => {
  try {
    const attendees = await Attendee.find({ event: eventId }).lean();
    
    for (const attendee of attendees) {
      if (type === 'updated') {
        await sendEventUpdateEmail(attendee.email, attendee.prenoms, eventData.title, eventData);
      } else if (type === 'deleted') {
        await sendEventCancellationEmail(attendee.email, attendee.prenoms, eventData.title);
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la notification des participants pour l'événement ${eventId}:`, error);
  }
};

// Obtenir tous les événements (pour le feed public)
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// Créer un événement (Admin)
const createEvent = async (req, res, next) => {
  try {
    const { title, type, date, time, location, description } = req.body;

    // Upload de chaque image en mémoire vers Cloudinary v2
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'meetnova/events');
        imageUrls.push(result.secure_url);
      }
    }

    const newEvent = await Event.create({
      title, type, date, time, location, description, images: imageUrls
    });

    // Notification en temps réel via Socket.io
    socket.getIO().emit('event:created', newEvent);

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    next(error);
  }
};

// Modifier un événement (Admin)
const updateEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updateData = { ...req.body };

    // Si de nouvelles images sont envoyées, on les uploade sur Cloudinary v2
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'meetnova/events');
        imageUrls.push(result.secure_url);
      }
      updateData.images = imageUrls;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updatedEvent) {
      res.status(404);
      throw new Error('Événement introuvable');
    }

    // Notification en temps réel
    socket.getIO().emit('event:updated', updatedEvent);

    // Notification des inscrits par email (non-bloquant)
    notifyParticipants(id, 'updated', updatedEvent);

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

// Supprimer un événement (Admin)
const deleteEvent = async (req, res, next) => {
  const { id } = req.params;
  try {
    const eventToDelete = await Event.findById(id);
    if (!eventToDelete) {
      res.status(404);
      throw new Error('Événement introuvable');
    }

    await Event.findByIdAndDelete(id);

    // Notification en temps réel
    socket.getIO().emit('event:deleted', id);

    // Notification des inscrits par email
    notifyParticipants(id, 'deleted', eventToDelete);

    res.status(200).json({ success: true, message: 'Événement supprimé' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
