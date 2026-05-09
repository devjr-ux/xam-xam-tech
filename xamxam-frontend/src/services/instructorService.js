import api from './api'

export const instructorService = {
  // ── Dashboard ──────────────────────────────────────────────────
  getDashboard: () => api.get('/dashboard'),
  getStats:     () => api.get('/instructor/stats'),

  // ── Mes cours ──────────────────────────────────────────────────
  getMyCourses:  (params) => api.get('/instructor/courses', { params }),
  createCourse:  (data)   => api.post('/courses', data),
  updateCourse:  (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse:  (id)     => api.delete(`/courses/${id}`),
  submitCourse:  (id)     => api.post(`/courses/${id}/submit`),
  getCourse:     (id)     => api.get(`/courses/${id}`),
  uploadThumbnail: (id, file) => {
    const form = new FormData()
    form.append('thumbnail', file)
    return api.post(`/courses/${id}/thumbnail`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // ── Sections ───────────────────────────────────────────────────
  getSections:    (courseId)        => api.get(`/courses/${courseId}/sections`),
  createSection:  (courseId, data)  => api.post(`/courses/${courseId}/sections`, data),
  updateSection:  (sectionId, data) => api.put(`/sections/${sectionId}`, data),
  deleteSection:  (sectionId)       => api.delete(`/sections/${sectionId}`),
  reorderSections:(courseId, data)  => api.post(`/courses/${courseId}/sections/reorder`, data),

  // ── Leçons ─────────────────────────────────────────────────────
  createLesson:  (courseId, data)  => api.post(`/courses/${courseId}/lessons`, data),
  updateLesson:  (lessonId, data)  => api.put(`/lessons/${lessonId}`, data),
  deleteLesson:  (lessonId)        => api.delete(`/lessons/${lessonId}`),
  uploadLessonFile: (lessonId, file, type, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    form.append('type', type)
    return api.post(`/lessons/${lessonId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },

  // ── Quiz ───────────────────────────────────────────────────────
  getQuizForInstructor: (quizId)       => api.get(`/quizzes/${quizId}/instructor`),
  createQuiz:           (lessonId, data) => api.post(`/lessons/${lessonId}/quiz`, data),
  updateQuiz:           (quizId, data)   => api.put(`/quizzes/${quizId}`, data),
  addQuestion:          (quizId, data)   => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (quizId, questionId, data) =>
    api.put(`/quizzes/${quizId}/questions/${questionId}`, data),
  deleteQuestion: (quizId, questionId) =>
    api.delete(`/quizzes/${quizId}/questions/${questionId}`),

  // ── Apprenants ─────────────────────────────────────────────────
  getStudents: (params) => api.get('/instructor/students', { params }),

  // ── Catégories ─────────────────────────────────────────────────
  getCategories: () => api.get('/categories'),
}
