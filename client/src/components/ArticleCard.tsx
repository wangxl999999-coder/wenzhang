import React, { useState } from 'react';
import { Heart, Eye, ThumbsUp, MessageCircle, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import dayjs from 'dayjs';
import type { Article } from '@/types';
import { favoriteApi } from '@/services/api';
import { useUserStore } from '@/store/userStore';
import LoadingSpinner from './LoadingSpinner';

interface ArticleCardProps {
  article: Article;
  onFavoriteChange?: (articleId: string, isFavorite: boolean) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onFavoriteChange }) => {
  const { isAuthenticated } = useUserStore();
  const [isFavorite, setIsFavorite] = useState(article.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);

  const platformColorClass = `platform-${article.platform}`;

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(article._id || article.id);
        setIsFavorite(false);
      } else {
        await favoriteApi.addFavorite(article._id || article.id);
        setIsFavorite(true);
      }
      onFavoriteChange?.(article._id || article.id, !isFavorite);
    } catch (error) {
      console.error('收藏操作失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-4 md:p-5 cursor-pointer group">
      <div className="flex flex-col md:flex-row gap-4">
        {article.coverImage && (
          <div className="md:w-48 md:flex-shrink-0">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-32 md:h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`tag ${platformColorClass}`}>
              {article.platform}
            </span>
            {article.category && (
              <span className="tag bg-gray-100 text-gray-600">
                {article.category}
              </span>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {article.summary}
            </p>
          )}

          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.keywords.slice(0, 5).map((keyword, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(article.views)}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {formatNumber(article.likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {formatNumber(article.comments)}
              </span>
              {article.publishTime && (
                <span className="hidden md:inline">
                  {dayjs(article.publishTime).format('MM-DD HH:mm')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : isFavorite ? (
                  <BookmarkCheck className="w-5 h-5 fill-current" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>

              <a
                href={article.sourceUrl || article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
