const express = require('express');
const router = express.Router();
const { getNews, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getNews);
router.post('/', protectAdmin, upload.array('media', 10), createNews);
router.put('/:id', protectAdmin, upload.array('media', 10), updateNews);
router.delete('/:id', protectAdmin, deleteNews);

module.exports = router;
