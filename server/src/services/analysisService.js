const { Article, HotKeyword } = require('../models');
const nodejieba = require('nodejieba');

const stopWords = new Set([
  '的', '是', '在', '了', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '他', '她', '它', '们', '这个', '那个', '什么', '怎么',
  '为什么', '哪', '哪里', '谁', '多少', '几', '啊', '吧', '呢', '吗', '呀',
  '今天', '明天', '昨天', '今年', '去年', '明年', '现在', '然后', '但是',
  '因为', '所以', '如果', '虽然', '而且', '或者', '以及', '关于', '对于'
]);

const extractKeywords = (text, topN = 10) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  try {
    const words = nodejieba.extract(text, topN * 2);
    
    const filteredWords = words.filter(word => {
      const cleanWord = word.word.trim();
      return cleanWord.length >= 2 && 
             !stopWords.has(cleanWord) &&
             !/^\d+$/.test(cleanWord);
    });

    return filteredWords.slice(0, topN).map(word => word.word);
  } catch (error) {
    console.error('提取关键词失败:', error.message);
    return [];
  }
};

const analyzeArticleKeywords = async (article) => {
  const text = `${article.title} ${article.summary || ''} ${article.content || ''}`;
  const keywords = extractKeywords(text, 15);
  
  if (keywords.length > 0) {
    article.keywords = keywords;
    await article.save();
  }
  
  return keywords;
};

const analyzeDailyKeywords = async (date = new Date()) => {
  console.log('开始分析每日热点词...');
  
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const articles = await Article.find({
    crawlDate: {
      $gte: startDate,
      $lte: endDate
    }
  });

  if (articles.length === 0) {
    console.log('没有找到今日文章进行分析');
    return [];
  }

  const keywordMap = new Map();
  const platformMap = new Map();
  const articleCountMap = new Map();

  for (const article of articles) {
    let keywords = article.keywords;
    
    if (!keywords || keywords.length === 0) {
      keywords = await analyzeArticleKeywords(article);
    }

    for (const keyword of keywords) {
      const current = keywordMap.get(keyword) || 0;
      keywordMap.set(keyword, current + 1);

      const platforms = platformMap.get(keyword) || new Set();
      platforms.add(article.platform);
      platformMap.set(keyword, platforms);

      const articleIds = articleCountMap.get(keyword) || new Set();
      articleIds.add(article._id.toString());
      articleCountMap.set(keyword, articleIds);
    }
  }

  const hotKeywords = [];

  for (const [keyword, count] of keywordMap.entries()) {
    const platforms = Array.from(platformMap.get(keyword) || []);
    const articleCount = (articleCountMap.get(keyword) || new Set()).size;
    
    const platformScore = platforms.length * 10;
    const hotScore = count * 5 + platformScore + articleCount * 2;

    hotKeywords.push({
      keyword,
      count,
      platforms,
      articleCount,
      hotScore,
      crawlDate: startDate
    });
  }

  hotKeywords.sort((a, b) => b.hotScore - a.hotScore);

  for (const item of hotKeywords) {
    try {
      await HotKeyword.findOneAndUpdate(
        { keyword: item.keyword, crawlDate: item.crawlDate },
        item,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('保存热点词失败:', error.message);
    }
  }

  console.log(`分析完成，共找到 ${hotKeywords.length} 个热点词`);
  return hotKeywords;
};

const getTrendingAnalysis = async (days = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await HotKeyword.aggregate([
    {
      $match: {
        crawlDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$keyword',
        totalCount: { $sum: '$count' },
        avgHotScore: { $avg: '$hotScore' },
        platforms: { $addToSet: '$platforms' },
        dailyData: {
          $push: {
            date: '$crawlDate',
            count: '$count',
            hotScore: '$hotScore'
          }
        }
      }
    },
    {
      $sort: { avgHotScore: -1 }
    },
    {
      $limit: 50
    }
  ]);

  return trends.map(trend => ({
    keyword: trend._id,
    totalCount: trend.totalCount,
    avgHotScore: trend.avgHotScore,
    platforms: [...new Set(trend.platforms.flat())],
    dailyData: trend.dailyData.sort((a, b) => new Date(a.date) - new Date(b.date))
  }));
};

const generateRecommendations = async () => {
  const hotKeywords = await HotKeyword.find()
    .sort({ hotScore: -1 })
    .limit(20);

  const recommendations = hotKeywords.map(item => ({
    keyword: item.keyword,
    hotScore: item.hotScore,
    platforms: item.platforms,
    articleCount: item.articleCount,
    recommendation: `关于"${item.keyword}"的话题热度较高，建议关注${item.platforms.join('、')}等平台的相关内容`
  }));

  return recommendations;
};

module.exports = {
  extractKeywords,
  analyzeArticleKeywords,
  analyzeDailyKeywords,
  getTrendingAnalysis,
  generateRecommendations
};
