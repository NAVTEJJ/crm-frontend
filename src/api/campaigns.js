import client from './client'

export const campaignsApi = {
  list: (params = {}) =>
    client.get('/campaigns/', { params }).then((r) => r.data),

  get: (id) =>
    client.get(`/campaigns/${id}`).then((r) => r.data),

  create: (data) =>
    client.post('/campaigns/', data).then((r) => r.data),

  update: (id, data) =>
    client.put(`/campaigns/${id}`, data).then((r) => r.data),

  delete: (id) =>
    client.delete(`/campaigns/${id}`).then((r) => r.data),
}
