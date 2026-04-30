require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { startScheduler, runManualCrawl } = require('./services/schedulerService');

const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    time: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('错误:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

const startServer = async () => {
  try {
    console.log('正在连接数据库...');
    await connectDB();
    console.log('数据库连接成功');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`API 地址: http://localhost:${PORT}/api`);
      console.log(`健康检查: http://localhost:${PORT}/api/health`);
    });

    try {
      startScheduler();
      console.log('定时任务调度器已启动');
    } catch (schedulerError) {
      console.warn('定时任务启动失败，但服务将继续运行:', schedulerError.message);
    }

    try {
      console.log('执行初始数据抓取...');
      await runManualCrawl();
      console.log('初始数据抓取完成');
    } catch (crawlError) {
      console.warn('初始数据抓取失败，但服务将继续运行:', crawlError.message);
    }

  } catch (error) {
    console.error('服务器启动失败:', error.message);
    console.log('错误详情:', error);
    process.exit(1);
  }
};

startServer();
