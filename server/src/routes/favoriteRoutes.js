const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:articleId', favoriteController.removeFavorite);
router.get('/check/:articleId', favoriteController.checkFavorite);

module.exports = router;
