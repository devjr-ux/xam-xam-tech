import api from './api'

export const quizService = {
  getByLesson: (lessonId) => api.get(`/lessons/${lessonId}/quiz`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  getResults: (quizId) => api.get(`/quizzes/${quizId}/results`),
}
