import api from './api'

export const studentService = {
  getDashboard:   ()         => api.get('/dashboard'),
  getMyCourses:   ()         => api.get('/my-courses'),
  getCourses:     (params)   => api.get('/courses', { params }),
  getCourse:      (id)       => api.get(`/courses/${id}`),
  enroll:         (id)       => api.post(`/courses/${id}/enroll`),
  checkAccess:    (id)       => api.get(`/courses/${id}/access`),
  getProgress:    (id)       => api.get(`/courses/${id}/progress`),
  getCategories:  ()         => api.get('/categories'),

  // Paiement
  initiatePayment: (enrollmentId)       => api.get(`/enrollments/${enrollmentId}/payment`),
  confirmPayment:  (enrollmentId, data) => api.post(`/enrollments/${enrollmentId}/payment/confirm`, data),
  paymentStatus:   (enrollmentId)       => api.get(`/enrollments/${enrollmentId}/payment/status`),
}
