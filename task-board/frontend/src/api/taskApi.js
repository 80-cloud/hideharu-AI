import axios from 'axios'

// Vite のプロキシ設定により /api/* は http://localhost:8080 に転送される

function assertPositiveInt(id, fnName) {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`[${fnName}] 無効なID: ${id}`)
  }
}

export async function fetchAllTasks() {
  const response = await axios.get('/api/tasks')
  return response.data
}

export async function createTask(data) {
  const response = await axios.post('/api/tasks', data)
  return response.data
}

export async function updateTask(id, data) {
  assertPositiveInt(id, 'updateTask')
  const response = await axios.put(`/api/tasks/${id}`, data)
  return response.data
}

export async function deleteTask(id) {
  assertPositiveInt(id, 'deleteTask')
  await axios.delete(`/api/tasks/${id}`)
}
