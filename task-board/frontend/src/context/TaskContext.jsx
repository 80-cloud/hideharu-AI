import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { fetchAllTasks, createTask as apiCreateTask } from '../api/taskApi'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAllTasks()
      .then(data => setAllTasks(data))
      .catch(() => setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。'))
      .finally(() => setLoading(false))
  }, [])

  async function addTask(data) {
    const created = await apiCreateTask(data)
    setAllTasks(prev => [...prev, created])
  }

  const tasks = useMemo(() => {
    return allTasks
      .filter(t => statusFilter === 'all' || t.status === statusFilter)
      .filter(t => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        )
      })
  }, [allTasks, searchQuery, statusFilter])

  return (
    <TaskContext.Provider value={{ tasks, loading, error, searchQuery, setSearchQuery, statusFilter, setStatusFilter, addTask }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  return useContext(TaskContext)
}
