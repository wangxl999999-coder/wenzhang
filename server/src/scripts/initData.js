require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const initData = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hot-articles';
    
    console.log(`正在连接 MongoDB: ${mongodbUri}`);
    await mongoose.connect(mongodbUri);
    console.log('MongoDB 连接成功');

    const User = mongoose.model('User', new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      avatar: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));

    const testUsers = [
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123456',
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123456',
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (existingUser) {
        console.log(`用户 ${userData.username} (${userData.email}) 已存在，跳过创建`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      });

      await user.save();
      console.log(`✓ 已创建测试用户: ${userData.username} / ${userData.password}`);
    }

    console.log('');
    console.log('========================================');
    console.log('数据初始化完成!');
    console.log('========================================');
    console.log('');
    console.log('可用测试账户:');
    console.log('1. 用户名: testuser');
    console.log('   邮箱: test@example.com');
    console.log('   密码: test123456');
    console.log('');
    console.log('2. 用户名: admin');
    console.log('   邮箱: admin@example.com');
    console.log('   密码: admin123456');
    console.log('');
    console.log('========================================');

    await mongoose.disconnect();
    console.log('数据库连接已关闭');

  } catch (error) {
    console.error('数据初始化失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
};

initData();
