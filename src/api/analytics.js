import client from './client'

export const analyticsApi = {
  list: (params = {}) =>
    client.get('/analytics/', { params }).then((r) => r.data),

  summary: (campaignId) =>
    client.get(`/analytics/summary/${campaignId}`).then((r) => r.data),

  create: (data) =>
    client.post('/analytics/', data).then((r) => r.data),
}
