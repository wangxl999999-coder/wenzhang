const mongoose = require('mongoose');

const hotKeywordSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    required: true,
    default: 1
  },
  platforms: [{
    type: String,
    enum: ['今日头条', '百度热搜', '网易新闻', '新浪新闻', '微信公众号']
  }],
  articleCount: {
    type: Number,
    default: 0
  },
  hotScore: {
    type: Number,
    default: 0
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

hotKeywordSchema.index({ keyword: 1, crawlDate: -1 }, { unique: true });
hotKeywordSchema.index({ crawlDate: -1, hotScore: -1 });

module.exports = mongoose.model('HotKeyword', hotKeywordSchema);
