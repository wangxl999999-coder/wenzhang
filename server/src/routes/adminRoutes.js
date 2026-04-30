const express = require('express');
const { runManualCrawl } = require('../services/schedulerService');
const { crawlAllPlatforms } = require('../services/crawlerService');
const { analyzeDailyKeywords } = require('../services/analysisService');

const router = express.Router();

router.post('/crawl', async (req, res) => {
  try {
    console.log('收到手动抓取请求...');
    
    const result = await runManualCrawl();
    
    res.json({
      success: result.success,
      message: result.message,
      data: {
        savedCount: result.savedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '手动抓取失败',
      error: error.message
    });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { date } = req.body;
    
    console.log('收到手动分析请求...');
    
    const analyzeDate = date ? new Date(date) : new Date();
    const hotKeywords = await analyzeDailyKeywords(analyzeDate);
    
    res.json({
      success: true,
      message: '分析完成',
      data: {
        keywordCount: hotKeywords.length,
        date: analyzeDate.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '分析失败',
      error: error.message
    });
  }
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'running',
      time: new Date().toISOString(),
      scheduledTasks: [
        { name: '抓取任务', schedule: '每天 8:00, 12:00, 18:00, 22:00' },
        { name: '每日分析任务', schedule: '每天 1:00' }
      ]
    }
  });
});

module.exports = router;
