import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Emails
export const getEmails = (params) => api.get('/emails', { params }).then(r => r.data)
export const getEmail = (id) => api.get(`/emails/${id}`).then(r => r.data)
export const createEmail = (formData) => api.post('/emails', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
export const deleteEmail = (id) => api.delete(`/emails/${id}`).then(r => r.data)
export const bulkDeleteEmails = (ids) => api.post('/emails/bulk-delete', ids).then(r => r.data)

// Pipeline
export const runPipeline = (emailId) => api.post(`/pipeline/run/${emailId}`).then(r => r.data)
export const runBatchPipeline = (emailIds) => api.post('/pipeline/run-batch', emailIds).then(r => r.data)
export const getPipelineRuns = (params) => api.get('/pipeline/runs', { params }).then(r => r.data)
export const getPipelineRun = (id) => api.get(`/pipeline/runs/${id}`).then(r => r.data)

// Stats
export const getStats = () => api.get('/stats').then(r => r.data)
export const getVolume = () => api.get('/stats/volume').then(r => r.data)
export const getActivity = () => api.get('/stats/activity').then(r => r.data)

// Exports
export const getJsonOutput = (emailId) => api.get(`/exports/json/${emailId}`).then(r => r.data)
export const downloadExcel = (emailId) => `/api/exports/excel/${emailId}`
export const downloadCsv = (emailId) => `/api/exports/csv/${emailId}`
export const bulkExportExcel = (emailIds) => api.post('/exports/bulk-excel', emailIds, { responseType: 'blob' }).then(r => {
  const url = window.URL.createObjectURL(r.data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bulk_export.zip'
  a.click()
  window.URL.revokeObjectURL(url)
})

export default api
