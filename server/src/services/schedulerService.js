const cron = require('node-cron');
const { crawlAllPlatforms } = require('./crawlerService');
const { analyzeDailyKeywords } = require('./analysisService');

let scheduledTasks = [];

const initScheduler = () => {
  console.log('初始化定时任务...');

  const crawlTask = cron.schedule('0 8,12,18,22 * * *', async () => {
    console.log('执行定时抓取任务:', new Date().toLocaleString());
    try {
      const savedCount = await crawlAllPlatforms();
      console.log(`定时抓取完成，保存了 ${savedCount} 篇新文章`);
      
      console.log('开始执行热点分析...');
      await analyzeDailyKeywords();
      console.log('热点分析完成');
    } catch (error) {
      console.error('定时任务执行失败:', error.message);
    }
  }, {
    scheduled: false,
    timezone: 'Asia/Shanghai'
  });

  const dailyAnalysisTask = cron.schedule('0 1 * * *', async () => {
    console.log('执行每日热点分析任务:', new Date().toLocaleString());
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      await analyzeDailyKeywords(yesterday);
      console.log('每日热点分析完成');
    } catch (error) {
      console.error('每日分析任务执行失败:', error.message);
    }
  }, {
    scheduled: false,
    timezone: 'Asia/Shanghai'
  });

  scheduledTasks = [crawlTask, dailyAnalysisTask];
  
  return scheduledTasks;
};

const startScheduler = () => {
  console.log('启动定时任务调度器...');
  
  if (scheduledTasks.length === 0) {
    initScheduler();
  }

  scheduledTasks.forEach(task => {
    task.start();
  });

  console.log('定时任务调度器已启动');
  console.log('抓取任务时间: 每天 8:00, 12:00, 18:00, 22:00');
  console.log('每日分析任务时间: 每天 1:00');
};

const stopScheduler = () => {
  console.log('停止定时任务调度器...');
  
  scheduledTasks.forEach(task => {
    task.stop();
  });

  console.log('定时任务调度器已停止');
};

const runManualCrawl = async () => {
  console.log('执行手动抓取任务...');
  
  try {
    const savedCount = await crawlAllPlatforms();
    console.log(`手动抓取完成，保存了 ${savedCount} 篇新文章`);
    
    console.log('开始执行热点分析...');
    await analyzeDailyKeywords();
    console.log('热点分析完成');
    
    return {
      success: true,
      savedCount,
      message: '手动抓取和分析完成'
    };
  } catch (error) {
    console.error('手动抓取任务执行失败:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = {
  initScheduler,
  startScheduler,
  stopScheduler,
  runManualCrawl
};
