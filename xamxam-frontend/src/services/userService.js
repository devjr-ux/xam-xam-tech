import api from './api'

export const userService = {
  updateProfile:  (data)       => api.put('/profile', data),
  getAllUsers:     (params)     => api.get('/admin/users', { params }),
  adminUpdateUser:(id, data)   => api.put(`/admin/users/${id}`, data),
  deleteUser:     (id)         => api.delete(`/admin/users/${id}`),
  myStudents:     ()           => api.get('/instructor/students'),
  getDashboard:   ()           => api.get('/dashboard'),
}
