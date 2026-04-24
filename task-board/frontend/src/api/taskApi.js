import axios from 'axios'

// Vite のプロキシ設定により /api/* は http://localhost:8080 に転送される
export async function fetchAllTasks() {
  const response = await axios.get('/api/tasks')
  return response.data
}
