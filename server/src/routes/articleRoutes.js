const express = require('express');
const articleController = require('../controllers/articleController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', articleController.getArticles);
router.get('/platforms', articleController.getPlatforms);
router.get('/hot-keywords', articleController.getHotKeywords);
router.get('/statistics', articleController.getStatistics);
router.get('/:id', articleController.getArticleById);

module.exports = router;
