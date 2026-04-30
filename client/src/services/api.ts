import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse, ArticlesResponse, LoginResponse, RegisterResponse, StatisticsResponse, HotKeyword, Article } from '@/types';

const API_BASE_URL = '/api';

export interface ServiceStatus {
  server: boolean;
  database: boolean;
  message?: string;
}

let serviceStatus: ServiceStatus = {
  server: true,
  database: true,
};

export const getServiceStatus = (): ServiceStatus => serviceStatus;

const formatErrorMessage = (error: AxiosError): string => {
  if (!error.response) {
    if (error.code === 'ERR_NETWORK') {
      return '无法连接到服务器，请检查后端服务是否已启动';
    }
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请稍后重试';
    }
    return '网络连接失败，请检查网络连接';
  }

  const status = error.response.status;
  const data = error.response.data as any;

  if (data?.message) {
    return data.message;
  }

  switch (status) {
    case 400:
      return '请求参数错误';
    case 401:
      return '未授权，请先登录';
    case 403:
      return '没有权限执行此操作';
    case 404:
      return '请求的资源不存在';
    case 500:
      return '服务器内部错误';
    case 503:
      return '服务暂不可用，请稍后重试';
    default:
      return `请求失败 (${status})`;
  }
};

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
  (response) => {
    serviceStatus.server = true;
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      serviceStatus.server = false;
      console.error('网络错误:', error.message);
    } else if (error.response.status === 503) {
      serviceStatus.database = false;
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const healthApi = {
  checkHealth: async (): Promise<{
    success: boolean;
    server: boolean;
    database: boolean;
    message?: string;
  }> => {
    try {
      const response = await api.get('/health');
      const data = response.data;
      serviceStatus = {
        server: true,
        database: data.database === '已连接',
      };
      return {
        success: true,
        server: true,
        database: data.database === '已连接',
        message: data.message,
      };
    } catch (error) {
      serviceStatus = {
        server: false,
        database: false,
        message: formatErrorMessage(error as AxiosError),
      };
      return {
        success: false,
        server: false,
        database: false,
        message: formatErrorMessage(error as AxiosError),
      };
    }
  },

  getStatus: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/status');
    return response.data;
  },
};

export const userApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  register: async (username: string, email: string, password: string): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response = await api.post('/users/register', { username, email, password });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  updateProfile: async (data: { username?: string; avatar?: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
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
    try {
      const response = await api.get('/articles', { params });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  getArticleById: async (id: string): Promise<ApiResponse<Article>> => {
    try {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  getHotKeywords: async (params?: {
    date?: string;
    limit?: number;
  }): Promise<ApiResponse<{ keywords: HotKeyword[] }>> => {
    try {
      const response = await api.get('/articles/hot-keywords', { params });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  getPlatforms: async (): Promise<ApiResponse<{ platforms: string[] }>> => {
    try {
      const response = await api.get('/articles/platforms');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  getStatistics: async (params?: {
    date?: string;
  }): Promise<ApiResponse<StatisticsResponse>> => {
    try {
      const response = await api.get('/articles/statistics', { params });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },
};

export const favoriteApi = {
  getFavorites: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ArticlesResponse>> => {
    try {
      const response = await api.get('/favorites', { params });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  addFavorite: async (articleId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/favorites', { articleId });
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  removeFavorite: async (articleId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/favorites/${articleId}`);
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  checkFavorite: async (articleId: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    try {
      const response = await api.get(`/favorites/check/${articleId}`);
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },
};

export const adminApi = {
  manualCrawl: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/admin/crawl');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },

  getStatus: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/status');
      return response.data;
    } catch (error) {
      throw new Error(formatErrorMessage(error as AxiosError));
    }
  },
};

export default api;
