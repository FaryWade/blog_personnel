import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blog_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- AUTH ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ---- ARTICLES ----
export const articlesAPI = {
  getAll: () => api.get('/articles'),           // articles publics amis + les miens
  getMine: () => api.get('/articles/mine'),      // mes articles
  getOne: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`),
};

// ---- COMMENTS ----
export const commentsAPI = {
  getByArticle: (articleId) => api.get(`/articles/${articleId}/comments`),
  create: (articleId, data) => api.post(`/articles/${articleId}/comments`, data),
  delete: (articleId, commentId) => api.delete(`/articles/${articleId}/comments/${commentId}`),
};

// ---- FRIENDS ----
export const friendsAPI = {
  getList: () => api.get('/friends'),
  getRequests: () => api.get('/friends/requests'),
  search: (username) => api.get(`/users/search?username=${username}`),
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  acceptRequest: (requestId) => api.put(`/friends/request/${requestId}/accept`),
  rejectRequest: (requestId) => api.put(`/friends/request/${requestId}/reject`),
  remove: (friendId) => api.delete(`/friends/${friendId}`),
  block: (friendId) => api.post(`/friends/${friendId}/block`),
};

export default api;
