import api from './api'

export const certificateService = {
  getAll:    ()   => api.get('/certificates'),
  getById:   (id) => api.get(`/certificates/${id}`),
  download:  (id) => api.get(`/certificates/${id}/download`),
}
