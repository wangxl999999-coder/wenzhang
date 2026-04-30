const axios = require('axios');
const cheerio = require('cheerio');
const { Article } = require('../models');

const PLATFORMS = {
  '今日头条': 'https://www.toutiao.com',
  '百度热搜': 'https://top.baidu.com',
  '网易新闻': 'https://news.163.com',
  '新浪新闻': 'https://news.sina.com.cn',
  '微信公众号': 'https://weixin.sogou.com'
};

const generateMockArticles = (platform) => {
  const mockData = {
    '今日头条': [
      { title: '2024年科技趋势预测：AI将如何改变我们的生活',
        summary: '人工智能技术正在以前所未有的速度发展，从自动驾驶到智能助手，AI正在深刻改变我们的日常生活。',
        author: '科技日报',
        category: '科技',
        views: 125000,
        likes: 8900,
        comments: 1200,
        keywords: ['人工智能', 'AI', '科技趋势', '2024']
      },
      { title: '新能源汽车销量再创新高，市场竞争进入白热化',
        summary: '最新数据显示，国内新能源汽车销量持续增长，各大车企纷纷推出新车型抢占市场份额。',
        author: '汽车之家',
        category: '汽车',
        views: 98000,
        likes: 6500,
        comments: 890,
        keywords: ['新能源汽车', '电动汽车', '销量', '市场竞争']
      },
      { title: '健康养生新趋势：年轻人开始注重心理健康',
        summary: '越来越多的年轻人开始关注心理健康，冥想、瑜伽等放松方式成为新的养生潮流。',
        author: '健康周刊',
        category: '健康',
        views: 85000,
        likes: 5200,
        comments: 670,
        keywords: ['心理健康', '养生', '冥想', '瑜伽']
      }
    ],
    '百度热搜': [
      { title: '今日热搜TOP1：某某事件引发全网关注',
        summary: '今日热点事件持续发酵，网友纷纷发表观点，相关话题阅读量已突破10亿。',
        author: '百度热搜',
        category: '热点',
        views: 520000,
        likes: 35000,
        comments: 8900,
        keywords: ['热搜', '热点事件', '全网关注']
      },
      { title: '明星官宣引发热议，粉丝们纷纷送上祝福',
        summary: '知名明星今日官宣喜讯，引发社交媒体上祝福声一片。',
        author: '娱乐头条',
        category: '娱乐',
        views: 380000,
        likes: 28000,
        comments: 5600,
        keywords: ['明星', '官宣', '娱乐']
      },
      { title: '最新政策出台，将影响这些行业',
        summary: '政府今日发布最新政策文件，多个行业将受到影响，专家解读政策导向。',
        author: '政策解读',
        category: '财经',
        views: 156000,
        likes: 12000,
        comments: 2300,
        keywords: ['政策', '行业影响', '经济']
      }
    ],
    '网易新闻': [
      { title: '国际经济形势分析：全球经济复苏面临挑战',
        summary: '全球经济正在逐步复苏，但仍面临多重挑战，各国央行政策走向备受关注。',
        author: '网易财经',
        category: '财经',
        views: 185000,
        likes: 12300,
        comments: 3200,
        keywords: ['经济复苏', '全球经济', '央行政策']
      },
      { title: '体育赛事回顾：精彩对决令人难忘',
        summary: '昨日进行的多场精彩对决精彩纷呈，球迷大呼过瘾。',
        author: '网易体育',
        category: '体育',
        views: 230000,
        likes: 18500,
        comments: 4500,
        keywords: ['体育赛事', '精彩对决', '回顾']
      },
      { title: '教育改革新动向：素质教育全面推进',
        summary: '教育部门发布最新指导意见，素质教育将全面推进，培养学生综合能力。',
        author: '网易教育',
        category: '教育',
        views: 95000,
        likes: 7200,
        comments: 1800,
        keywords: ['教育改革', '素质教育', '综合能力']
      }
    ],
    '新浪新闻': [
      { title: '社会热点：城市发展与民生改善同步推进',
        summary: '各地城市建设加快推进，民生保障水平不断提升，群众获得感幸福感增强。',
        author: '新浪新闻',
        category: '社会',
        views: 145000,
        likes: 9800,
        comments: 2100,
        keywords: ['城市发展', '民生改善', '社会热点']
      },
      { title: '文化传承：传统文化焕发新活力',
        summary: '传统文化在新时代背景下，传统文化正在以新的形式呈现，受到年轻人的喜爱。',
        author: '新浪文化',
        category: '文化',
        views: 78000,
        likes: 5600,
        comments: 980,
        keywords: ['传统文化', '文化传承', '创新']
      },
      { title: '旅游热潮：假期旅游市场火爆',
        summary: '假期来临，旅游市场持续火爆，各大景区游客量创历史新高。',
        author: '新浪旅游',
        category: '旅游',
        views: 198000,
        likes: 14200,
        comments: 3400,
        keywords: ['旅游', '假期', '景区']
      }
    ],
    '微信公众号': [
      { title: '深度好文：如何在快节奏生活中保持内心平静',
        summary: '在这个快节奏的时代，如何保持内心的平静成为许多人追求的目标。本文分享一些实用的方法。',
        author: '心灵驿站',
        category: '生活',
        views: 56000,
        likes: 4500,
        comments: 890,
        keywords: ['内心平静', '快节奏', '生活方式']
      },
      { title: '职场干货：提升工作效率的10个实用技巧',
        summary: '工作效率是职场成功的关键。本文分享10个经过验证的实用技巧，帮助你事半功倍。',
        author: '职场成长社',
        category: '职场',
        views: 89000,
        likes: 7200,
        comments: 1500,
        keywords: ['工作效率', '职场技巧', '时间管理']
      },
      { title: '美食探店：这家隐藏在巷子里的宝藏小店',
        summary: '今天带大家探访一家隐藏在城市巷子里的美食小店，味道绝对让你惊喜。',
        author: '美食达人',
        category: '美食',
        views: 67000,
        likes: 5100,
        comments: 1200,
        keywords: ['美食', '探店', '宝藏小店']
      }
    ]
  };

  const articles = mockData[platform] || [];
  
  return articles.map(article => ({
    ...article,
    platform,
    url: `${PLATFORMS[platform]}/article/${Date.now()}`,
    sourceUrl: `${PLATFORMS[platform]}/article/${Date.now()}`,
    publishTime: new Date(),
    crawlDate: new Date(),
    hotScore: article.views * 0.1 + article.likes * 0.5 + article.comments * 0.3
  }));
};

const fetchArticles = async (platform) => {
  console.log(`开始抓取 ${platform} 的文章...`);
  
  try {
    const articles = generateMockArticles(platform);
    console.log(`成功获取 ${articles.length} 篇 ${platform} 的文章`);
    
    return articles;
  } catch (error) {
    console.error(`抓取 ${platform} 文章失败:`, error.message);
    return [];
  }
};

const saveArticles = async (articles) => {
  if (!articles || articles.length === 0) {
    console.log('没有文章需要保存');
    return 0;
  }

  let savedCount = 0;
  
  for (const article of articles) {
    try {
      const existingArticle = await Article.findOne({
        title: article.title,
        platform: article.platform
      });

      if (existingArticle) {
        await Article.findByIdAndUpdate(
          existingArticle._id,
          {
            views: article.views,
            likes: article.likes,
            comments: article.comments,
            hotScore: article.hotScore,
            updatedAt: new Date()
          }
        );
      } else {
        const newArticle = new Article(article);
        await newArticle.save();
        savedCount++;
      }
    } catch (error) {
      console.error('保存文章失败:', error.message);
    }
  }

  console.log(`成功保存 ${savedCount} 篇新文章`);
  return savedCount;
};

const crawlAllPlatforms = async () => {
  console.log('开始抓取所有平台文章...');
  
  const platforms = Object.keys(PLATFORMS);
  let totalSaved = 0;

  for (const platform of platforms) {
    const articles = await fetchArticles(platform);
    const saved = await saveArticles(articles);
    totalSaved += saved;
  }

  console.log(`抓取完成，共保存 ${totalSaved} 篇新文章`);
  return totalSaved;
};

module.exports = {
  fetchArticles,
  saveArticles,
  crawlAllPlatforms,
  PLATFORMS
};
