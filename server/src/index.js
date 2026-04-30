require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

let dbConnected = false;

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
    time: new Date().toISOString(),
    database: dbConnected ? '已连接' : '未连接'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'running',
      port: PORT,
      database: dbConnected,
      time: new Date().toISOString(),
      features: {
        userAuth: dbConnected,
        articles: dbConnected,
        favorites: dbConnected,
        hotKeywords: dbConnected,
        scheduledTasks: true
      }
    }
  });
});

const dbCheckMiddleware = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      success: false,
      message: '数据库服务暂不可用，请稍后重试'
    });
  }
  next();
};

const lazyLoadRoutes = () => {
  if (dbConnected) {
    console.log('加载数据库相关路由...');
    
    const userRoutes = require('./routes/userRoutes');
    const articleRoutes = require('./routes/articleRoutes');
    const favoriteRoutes = require('./routes/favoriteRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    
    app.use('/api/users', dbCheckMiddleware, userRoutes);
    app.use('/api/articles', dbCheckMiddleware, articleRoutes);
    app.use('/api/favorites', dbCheckMiddleware, favoriteRoutes);
    app.use('/api/admin', dbCheckMiddleware, adminRoutes);
    
    console.log('数据库相关路由已加载');
  }
};

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

const connectDatabase = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hot-articles';
    
    console.log(`正在连接 MongoDB: ${mongodbUri}`);
    
    const conn = await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    dbConnected = true;
    console.log(`✓ MongoDB 连接成功: ${conn.connection.host}`);
    
    lazyLoadRoutes();
    
    try {
      const { startScheduler, runManualCrawl } = require('./services/schedulerService');
      startScheduler();
      console.log('✓ 定时任务调度器已启动');
      
      console.log('执行初始数据抓取...');
      await runManualCrawl();
      console.log('✓ 初始数据抓取完成');
    } catch (schedulerError) {
      console.warn('定时任务或数据抓取失败，但服务将继续运行:', schedulerError.message);
    }
    
    return true;
  } catch (error) {
    console.warn('========================================');
    console.warn('⚠️  MongoDB 连接失败!');
    console.warn('========================================');
    console.warn('错误信息:', error.message);
    console.warn('');
    console.warn('服务将继续运行，但以下功能将不可用:');
    console.warn('  - 用户注册/登录');
    console.warn('  - 文章列表/详情');
    console.warn('  - 收藏功能');
    console.warn('  - 热点分析');
    console.warn('');
    console.warn('要启用完整功能，请确保:');
    console.warn('1. MongoDB 服务已启动');
    console.warn('2. 连接字符串配置正确 (在 .env 文件中设置 MONGODB_URI)');
    console.warn('');
    console.warn('健康检查地址: http://localhost:' + PORT + '/api/health');
    console.warn('========================================');
    
    dbConnected = false;
    return false;
  }
};

const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('🚀 每日热点文章服务已启动');
      console.log('========================================');
      console.log(`端口: ${PORT}`);
      console.log(`API 地址: http://localhost:${PORT}/api`);
      console.log(`健康检查: http://localhost:${PORT}/api/health`);
      console.log(`状态检查: http://localhost:${PORT}/api/status`);
      console.log('========================================');
      console.log('');
      resolve(server);
    });

    server.on('error', (err) => {
      console.error('服务器启动失败:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请检查是否有其他服务正在使用该端口`);
      }
      process.exit(1);
    });
  });
};

const init = async () => {
  console.log('');
  console.log('========================================');
  console.log('📦 正在启动每日热点文章服务...');
  console.log('========================================');
  console.log('');

  await startServer();
  await connectDatabase();
  
  console.log('');
  console.log('✅ 服务初始化完成!');
  console.log('');
};

init();
