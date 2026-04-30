import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, TrendingUp, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { articleApi } from '@/services/api';
import type { Article, HotKeyword } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const PLATFORMS = ['全部', '今日头条', '百度热搜', '网易新闻', '新浪新闻', '微信公众号'];

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('全部');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (selectedPlatform !== '全部') {
        params.platform = selectedPlatform;
      }

      if (selectedDate) {
        params.date = selectedDate;
      }

      if (searchKeyword) {
        params.keyword = searchKeyword;
      }

      const response = await articleApi.getArticles(params);
      if (response.success) {
        setArticles(response.data.articles);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotKeywords = async () => {
    setKeywordsLoading(true);
    try {
      const response = await articleApi.getHotKeywords({ limit: 15 });
      if (response.success) {
        setHotKeywords(response.data.keywords);
      }
    } catch (error) {
      console.error('获取热点词失败:', error);
    } finally {
      setKeywordsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage, selectedPlatform, selectedDate]);

  useEffect(() => {
    fetchHotKeywords();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setCurrentPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    fetchArticles();
  };

  const handleFavoriteChange = (articleId: string, isFavorite: boolean) => {
    setArticles(prev =>
      prev.map(article =>
        article._id === articleId || article.id === articleId
          ? { ...article, isFavorite }
          : article
      )
    );
  };

  const resetFilters = () => {
    setSelectedPlatform('全部');
    setSelectedDate('');
    setSearchKeyword('');
    setCurrentPage(1);
  };

  const hasFilters = selectedPlatform !== '全部' || selectedDate || searchKeyword;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">
              每日热点文章
            </h1>
            <p className="text-primary-100 text-sm md:text-lg">
              聚合各大平台热点文章，智能分析热点趋势，为内容创作提供方向指导
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索文章标题、关键词..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-300 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-colors"
              >
                搜索
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">筛选：</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformChange(platform)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedPlatform === platform
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={dayjs().format('YYYY-MM-DD')}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    重置筛选
                  </button>
                )}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                共找到 <span className="font-medium text-gray-900">{total}</span> 篇文章
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <ArticleCard
                    key={article._id || article.id}
                    article={article}
                    onFavoriteChange={handleFavoriteChange}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">暂无文章</p>
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      重置筛选条件
                    </button>
                  )}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">今日热点词</h3>
              </div>

              {keywordsLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : hotKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hotKeywords.map((item, index) => (
                    <button
                      key={item._id}
                      onClick={() => handleKeywordClick(item.keyword)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        index === 0
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : index === 1
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : index === 2
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index < 3 && (
                        <span className={`text-xs ${
                          index === 0 ? 'text-red-500' : index === 1 ? 'text-orange-500' : 'text-amber-500'
                        }`}>
                          {index + 1}
                        </span>
                      )}
                      {item.keyword}
                      <span className="text-xs opacity-60">({item.count})</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  暂无热点词数据
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm p-5 text-white">
              <h3 className="font-semibold mb-2">创作指导提示</h3>
              <p className="text-sm text-primary-100 mb-4">
                根据今日热点词趋势，建议关注相关话题进行内容创作，可提高文章曝光度。
              </p>
              <div className="flex flex-wrap gap-1">
                {hotKeywords.slice(0, 5).map((item) => (
                  <span
                    key={item._id}
                    className="px-2 py-0.5 bg-white/20 rounded text-xs"
                  >
                    #{item.keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
