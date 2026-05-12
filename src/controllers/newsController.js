const News = require('../models/News');
const socket = require('../config/socket');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * Pourquoi : Gérer les actualités avec support multi-médias.
 */

const getNews = async (req, res, next) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
};

const createNews = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const mediaList = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'meetnova/news');
        
        let type = 'image';
        if (file.mimetype.startsWith('video/')) type = 'video';
        if (file.mimetype === 'application/pdf') type = 'pdf';

        mediaList.push({
          url: result.secure_url,
          type,
          publicId: result.public_id
        });
      }
    }

    const newNews = await News.create({
      title,
      content,
      media: mediaList,
      author: req.admin?._id
    });

    socket.getIO().emit('news:created', newNews);

    res.status(201).json({ success: true, data: newNews });
  } catch (error) {
    next(error);
  }
};

const updateNews = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const mediaList = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'meetnova/news');
        
        let type = 'image';
        if (file.mimetype.startsWith('video/')) type = 'video';
        if (file.mimetype === 'application/pdf') type = 'pdf';

        mediaList.push({
          url: result.secure_url,
          type,
          publicId: result.public_id
        });
      }
      updateData.media = mediaList;
    }

    const updatedNews = await News.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updatedNews) {
      res.status(404);
      throw new Error('Actualité introuvable');
    }

    socket.getIO().emit('news:updated', updatedNews);

    res.status(200).json({ success: true, data: updatedNews });
  } catch (error) {
    next(error);
  }
};

const deleteNews = async (req, res, next) => {
  const { id } = req.params;
  try {
    const newsToDelete = await News.findById(id);
    if (!newsToDelete) {
      res.status(404);
      throw new Error('Actualité introuvable');
    }

    await News.findByIdAndDelete(id);

    socket.getIO().emit('news:deleted', id);

    res.status(200).json({ success: true, message: 'Actualité supprimée' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNews, createNews, updateNews, deleteNews };
