import api from './api'

export const courseService = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getProgress: (id) => api.get(`/courses/${id}/progress`),
  updateProgress: (id, data) => api.post(`/courses/${id}/progress`, data),
  getCategories: () => api.get('/categories'),
}
