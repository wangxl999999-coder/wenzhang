export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt?: string;
}

export interface Article {
  _id: string;
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  sourceUrl: string;
  platform: string;
  author: string;
  publishTime: string;
  views: number;
  likes: number;
  comments: number;
  keywords: string[];
  hotScore: number;
  category: string;
  coverImage: string;
  crawlDate: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  favoriteId?: string;
}

export interface HotKeyword {
  _id: string;
  keyword: string;
  count: number;
  platforms: string[];
  articleCount: number;
  hotScore: number;
  crawlDate: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: Pagination;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface PlatformStats {
  _id: string;
  count: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface StatisticsResponse {
  totalArticles: number;
  platformStats: PlatformStats[];
  hotKeywords: HotKeyword[];
}

export interface Favorite {
  _id: string;
  userId: string;
  articleId: string | Article;
  createdAt: string;
}
