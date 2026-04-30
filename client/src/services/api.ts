import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse, ArticlesResponse, LoginResponse, RegisterResponse, StatisticsResponse, HotKeyword, Article } from '@/types';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<ApiResponse<RegisterResponse>> => {
    const response = await api.post('/users/register', { username, email, password });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { username?: string; avatar?: string }): Promise<ApiResponse<any>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

export const articleApi = {
  getArticles: async (params?: {
    platform?: string;
    date?: string;
    keyword?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<ArticlesResponse>> => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  getArticleById: async (id: string): Promise<ApiResponse<Article>> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  getHotKeywords: async (params?: {
    date?: string;
    limit?: number;
  }): Promise<ApiResponse<{ keywords: HotKeyword[] }>> => {
    const response = await api.get('/articles/hot-keywords', { params });
    return response.data;
  },

  getPlatforms: async (): Promise<ApiResponse<{ platforms: string[] }>> => {
    const response = await api.get('/articles/platforms');
    return response.data;
  },

  getStatistics: async (params?: {
    date?: string;
  }): Promise<ApiResponse<StatisticsResponse>> => {
    const response = await api.get('/articles/statistics', { params });
    return response.data;
  },
};

export const favoriteApi = {
  getFavorites: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ArticlesResponse>> => {
    const response = await api.get('/favorites', { params });
    return response.data;
  },

  addFavorite: async (articleId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/favorites', { articleId });
    return response.data;
  },

  removeFavorite: async (articleId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/favorites/${articleId}`);
    return response.data;
  },

  checkFavorite: async (articleId: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    const response = await api.get(`/favorites/check/${articleId}`);
    return response.data;
  },
};

export const adminApi = {
  manualCrawl: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/admin/crawl');
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/status');
    return response.data;
  },
};

export default api;
