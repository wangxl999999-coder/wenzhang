import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Bookmark, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { favoriteApi } from '@/services/api';
import type { Article } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const Favorites: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteApi.getFavorites({
        page: currentPage,
        limit: 12,
      });
      if (response.success) {
        setArticles(response.data.articles);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [currentPage, isAuthenticated]);

  const handleFavoriteChange = (articleId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      setArticles(prev =>
        prev.filter(article => article._id !== articleId && article.id !== articleId)
      );
      setTotal(prev => prev - 1);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">
              我的收藏
            </h1>
          </div>
          <p className="text-primary-100 text-sm md:text-base">
            共收藏 <span className="font-semibold">{total}</span> 篇文章
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <Bookmark className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无收藏文章
              </h3>
              <p className="text-gray-500 mb-6">
                浏览文章时点击收藏按钮，即可将文章保存到这里
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                去浏览文章
                <ChevronRight className="w-4 h-4" />
              </a>
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
    </div>
  );
};

export default Favorites;
