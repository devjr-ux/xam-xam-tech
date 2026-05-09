import api from './api'

export const adminService = {
  getDashboard: ()           => api.get('/dashboard'),
  getStats:     ()           => api.get('/admin/stats'),

  getUsers:   (params)       => api.get('/admin/users', { params }),
  updateUser: (id, data)     => api.put(`/admin/users/${id}`, data),
  deleteUser: (id)           => api.delete(`/admin/users/${id}`),

  getCourses:     (params)   => api.get('/admin/courses', { params }),
  publishCourse:  (id)       => api.post(`/admin/courses/${id}/publish`),
  rejectCourse:   (id)       => api.post(`/admin/courses/${id}/reject`),
  deleteCourse:   (id)       => api.delete(`/admin/courses/${id}`),
}
