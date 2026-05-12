const express = require('express');
const router = express.Router();
const { getNews, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getNews);
router.post('/', protect, upload.array('media', 10), createNews);
router.put('/:id', protect, upload.array('media', 10), updateNews);
router.delete('/:id', protect, deleteNews);

module.exports = router;
