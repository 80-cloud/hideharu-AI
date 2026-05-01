import axios from 'axios'

// Vite のプロキシ設定により /api/* は http://localhost:8080 に転送される
export async function fetchAllTasks() {
  const response = await axios.get('/api/tasks')
  return response.data
}

export async function fetchTasksByStatus(status) {
  const response = await axios.get(`/api/tasks?status=${status}`)
  return response.data
}

export async function createTask(data) {
  const response = await axios.post('/api/tasks', data)
  return response.data
}

export async function updateTask(id, data) {
  const response = await axios.put(`/api/tasks/${id}`, data)
  return response.data
}

export async function deleteTask(id) {
  await axios.delete(`/api/tasks/${id}`)
}
