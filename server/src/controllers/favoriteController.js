const { Favorite, Article } = require('../models');

const addFavorite = async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.user._id;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: '请提供文章ID'
      });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const existingFavorite = await Favorite.findOne({
      userId,
      articleId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: '该文章已收藏'
      });
    }

    const favorite = new Favorite({
      userId,
      articleId
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: '收藏成功',
      data: {
        favorite
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '收藏失败',
      error: error.message
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id;

    const result = await Favorite.findOneAndDelete({
      userId,
      articleId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: '该文章未被收藏'
      });
    }

    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消收藏失败',
      error: error.message
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const total = await Favorite.countDocuments({ userId });

    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('articleId');

    const articles = favorites.map(fav => ({
      ...fav.articleId.toObject(),
      favoriteId: fav._id,
      isFavorite: true
    }));

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败',
      error: error.message
    });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id;

    const isFavorite = await Favorite.exists({
      userId,
      articleId
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!isFavorite
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '检查收藏状态失败',
      error: error.message
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};
