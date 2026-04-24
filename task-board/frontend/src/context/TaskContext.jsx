import { createContext, useContext, useState, useEffect } from 'react'
import { fetchAllTasks } from '../api/taskApi'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllTasks()
      .then(data => setTasks(data))
      .catch(() => setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <TaskContext.Provider value={{ tasks, loading, error }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  return useContext(TaskContext)
}
