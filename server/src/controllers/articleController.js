const { Article, Favorite, HotKeyword } = require('../models');

const PLATFORMS = ['今日头条', '百度热搜', '网易新闻', '新浪新闻', '微信公众号'];

const getArticles = async (req, res) => {
  try {
    const {
      platform,
      date,
      keyword,
      page = 1,
      limit = 20,
      sortBy = 'hotScore',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (platform && PLATFORMS.includes(platform)) {
      query.platform = platform;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.crawlDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { keywords: keyword }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    let favoriteIds = [];
    if (req.user) {
      const favorites = await Favorite.find({ userId: req.user._id });
      favoriteIds = favorites.map(fav => fav.articleId.toString());
    }

    const articlesWithFavorite = articles.map(article => ({
      ...article.toObject(),
      isFavorite: favoriteIds.includes(article._id.toString())
    }));

    res.json({
      success: true,
      data: {
        articles: articlesWithFavorite,
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
      message: '获取文章列表失败',
      error: error.message
    });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    let isFavorite = false;
    if (req.user) {
      isFavorite = await Favorite.exists({
        userId: req.user._id,
        articleId: article._id
      });
    }

    res.json({
      success: true,
      data: {
        ...article.toObject(),
        isFavorite: !!isFavorite
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取文章详情失败',
      error: error.message
    });
  }
};

const getHotKeywords = async (req, res) => {
  try {
    const { date, limit = 20 } = req.query;

    const query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.crawlDate = {
        $gte: startDate,
        $lt: endDate
      };
    } else {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0));
      query.crawlDate = { $gte: startDate };
    }

    const keywords = await HotKeyword.find(query)
      .sort({ hotScore: -1, count: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        keywords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取热点词失败',
      error: error.message
    });
  }
};

const getPlatforms = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        platforms: PLATFORMS
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取平台列表失败',
      error: error.message
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const { date } = req.query;

    const query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.crawlDate = {
        $gte: startDate,
        $lt: endDate
      };
    } else {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0));
      query.crawlDate = { $gte: startDate };
    }

    const totalArticles = await Article.countDocuments(query);

    const platformStats = await Article.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: '$comments' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const hotKeywords = await HotKeyword.find(query)
      .sort({ hotScore: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalArticles,
        platformStats,
        hotKeywords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  getHotKeywords,
  getPlatforms,
  getStatistics
};
