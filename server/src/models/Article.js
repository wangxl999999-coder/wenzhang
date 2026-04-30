const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['今日头条', '百度热搜', '网易新闻', '新浪新闻', '微信公众号']
  },
  author: {
    type: String,
    trim: true
  },
  publishTime: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  keywords: [{
    type: String
  }],
  hotScore: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String
  },
  crawlDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

articleSchema.index({ platform: 1, crawlDate: -1 });
articleSchema.index({ crawlDate: -1 });
articleSchema.index({ hotScore: -1 });
articleSchema.index({ keywords: 1 });

module.exports = mongoose.model('Article', articleSchema);
