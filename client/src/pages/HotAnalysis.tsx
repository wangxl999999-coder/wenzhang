import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, Eye, ThumbsUp, MessageCircle, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { articleApi } from '@/services/api';
import type { HotKeyword, PlatformStats } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const PLATFORM_COLORS: Record<string, string> = {
  '今日头条': 'bg-red-500',
  '百度热搜': 'bg-blue-500',
  '网易新闻': 'bg-orange-500',
  '新浪新闻': 'bg-amber-500',
  '微信公众号': 'bg-green-500',
};

const HotAnalysis: React.FC = () => {
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedDate) {
        params.date = selectedDate;
      }

      const [statsResponse, keywordsResponse] = await Promise.all([
        articleApi.getStatistics(params),
        articleApi.getHotKeywords({ ...params, limit: 30 }),
      ]);

      if (statsResponse.success) {
        setTotalArticles(statsResponse.data.totalArticles);
        setPlatformStats(statsResponse.data.platformStats);
      }

      if (keywordsResponse.success) {
        setHotKeywords(keywordsResponse.data.keywords);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedDate]);

  const maxViews = platformStats.length > 0
    ? Math.max(...platformStats.map(s => s.totalViews))
    : 1;
  const maxArticles = platformStats.length > 0
    ? Math.max(...platformStats.map(s => s.count))
    : 1;

  const formatNumber = (num: number): string => {
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}亿`;
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8" />
                <h1 className="text-2xl md:text-3xl font-bold">
                  热点分析
                </h1>
              </div>
              <p className="text-primary-100 text-sm md:text-base">
                智能分析热点趋势，为内容创作提供方向指导
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <Calendar className="w-5 h-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={dayjs().format('YYYY-MM-DD')}
                className="bg-transparent border-none text-white outline-none placeholder-white/60"
                placeholder="选择日期"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">今日文章总数</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(totalArticles)}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-orange-100">平台数量</h3>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold">
                  {platformStats.length}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">热点词数量</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {hotKeywords.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">平台数据统计</h3>
                {platformStats.length > 0 ? (
                  <div className="space-y-4">
                    {platformStats.map((stat) => (
                      <div key={stat._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${PLATFORM_COLORS[stat._id] || 'bg-gray-500'}`}></div>
                            <span className="font-medium text-gray-900">{stat._id}</span>
                          </div>
                          <span className="text-sm text-gray-500">{stat.count} 篇文章</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${PLATFORM_COLORS[stat._id] || 'bg-gray-500'} transition-all duration-500`}
                            style={{ width: `${(stat.count / maxArticles) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(stat.totalViews)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {formatNumber(stat.totalLikes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {formatNumber(stat.totalComments)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无平台数据</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">创作指导建议</h3>
                {hotKeywords.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">🔥 热门话题推荐</h4>
                      <p className="text-sm text-blue-700">
                        根据今日热点词趋势，建议关注以下话题进行内容创作：
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {hotKeywords.slice(0, 8).map((item) => (
                          <span
                            key={item._id}
                            className="px-2 py-1 bg-white text-blue-700 rounded text-xs font-medium border border-blue-200"
                          >
                            #{item.keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">💡 创作建议</h4>
                      <ul className="text-sm text-green-700 space-y-2">
                        <li>• 结合当前热点词进行内容创作，可提高曝光度</li>
                        <li>• 关注多个平台的热点趋势，扩大内容覆盖范围</li>
                        <li>• 分析热点词关联文章的互动数据，优化创作方向</li>
                        <li>• 收藏感兴趣的文章，随时查看参考</li>
                      </ul>
                    </div>

                    {hotKeywords[0] && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-2">📊 今日最热</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-amber-900">
                              #{hotKeywords[0].keyword}
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                              出现 {hotKeywords[0].count} 次，覆盖 {hotKeywords[0].platforms.length} 个平台
                            </p>
                          </div>
                          <a
                            href={`/?keyword=${encodeURIComponent(hotKeywords[0].keyword)}`}
                            className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                          >
                            查看文章
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无热点分析数据</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">热点词排行榜</h3>
              {hotKeywords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotKeywords.map((item, index) => (
                    <a
                      key={item._id}
                      href={`/?keyword=${encodeURIComponent(item.keyword)}`}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? 'bg-red-500 text-white'
                          : index === 1
                          ? 'bg-orange-500 text-white'
                          : index === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          #{item.keyword}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>出现 {item.count} 次</span>
                          <span>•</span>
                          <span>{item.articleCount} 篇文章</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {item.platforms.length}平台
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">暂无热点词数据</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HotAnalysis;
