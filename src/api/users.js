import client from './client'

export const usersApi = {
  list: (params = {}) =>
    client.get('/users/', { params }).then((r) => r.data),

  get: (id) =>
    client.get(`/users/${id}`).then((r) => r.data),

  update: (id, data) =>
    client.put(`/users/${id}`, data).then((r) => r.data),

  delete: (id) =>
    client.delete(`/users/${id}`).then((r) => r.data),
}
