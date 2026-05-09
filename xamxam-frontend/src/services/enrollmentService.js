import api from './api'

export const enrollmentService = {
  enroll:         (courseId)             => api.post(`/courses/${courseId}/enroll`),
  getProgress:    (courseId)             => api.get(`/courses/${courseId}/progress`),
  updateProgress: (courseId, lessonId)   => api.post(`/courses/${courseId}/progress`, { lesson_id: lessonId }),
  myCourses:      ()                     => api.get('/my-courses'),
}
