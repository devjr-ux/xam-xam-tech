import api from './api'

export const forumService = {
  getPosts:   (params) => api.get('/forum/posts', { params }),
  getPost:    (id)     => api.get(`/forum/posts/${id}`),
  createPost: (data)   => api.post('/forum/posts', data),
  reply:      (id, content) => api.post(`/forum/posts/${id}/reply`, { content }),
  like:       (id)     => api.post(`/forum/posts/${id}/like`),
}
