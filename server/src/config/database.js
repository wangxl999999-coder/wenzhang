const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hot-articles';
    
    console.log(`正在连接 MongoDB: ${mongodbUri}`);
    
    const conn = await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('========================================');
    console.error('MongoDB 连接失败!');
    console.error('错误信息:', error.message);
    console.error('========================================');
    console.error('');
    console.error('请确保:');
    console.error('1. MongoDB 服务已启动');
    console.error('2. 连接字符串配置正确 (在 .env 文件中设置 MONGODB_URI)');
    console.error('');
    console.error('如果您没有安装 MongoDB，可以:');
    console.error('1. 下载并安装 MongoDB Community Server');
    console.error('2. 或者使用 MongoDB Atlas 等云服务');
    console.error('========================================');
    process.exit(1);
  }
};

module.exports = connectDB;
