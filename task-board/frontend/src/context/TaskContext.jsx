import { createContext, useCallback, useContext, useState, useEffect, useMemo } from 'react'
import { fetchAllTasks, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from '../api/taskApi'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAllTasks()
      .then(data => setAllTasks(Array.isArray(data) ? data : []))
      .catch(() => setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。'))
      .finally(() => setLoading(false))
  }, [])

  const addTask = useCallback(async (data) => {
    const created = await apiCreateTask(data)
    setAllTasks(prev => [...prev, created])
  }, [])

  const updateTask = useCallback(async (id, data) => {
    const updated = await apiUpdateTask(id, data)
    setAllTasks(prev => prev.map(t => t.id === id ? updated : t))
  }, [])

  const deleteTask = useCallback(async (id) => {
    await apiDeleteTask(id)
    setAllTasks(prev => prev.filter(t => t.id !== id))
  }, [])

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

  const contextValue = useMemo(() => ({
    tasks, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    addTask, updateTask, deleteTask,
  }), [tasks, loading, error, searchQuery, statusFilter, addTask, updateTask, deleteTask])

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  return useContext(TaskContext)
}
