// src/utils/api.js
import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 只在有token时添加
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // 只有在存在token时才添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 只有401错误且不是登录请求时才处理
    if (error.response?.status === 401) {
      // 检查是否是登录接口的401（正常的密码错误）
      const isLoginRequest = error.config.url.includes('/auth/login');
      
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 避免在登录页重复提示
        if (!window.location.pathname.includes('/login')) {
          message.error('登录已过期，请重新登录');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;