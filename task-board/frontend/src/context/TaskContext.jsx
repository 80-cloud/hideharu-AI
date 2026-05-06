import { createContext, useCallback, useContext, useState, useEffect, useMemo } from 'react'
import {
  fetchAllTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  reorderTasks as apiReorderTasks,
} from '../api/taskApi'

const TaskContext = createContext(null)

function bySortOrder(a, b) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
}

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

  // ドラッグ&ドロップで card を destStatus カラムの beforeId の直前に挿入する。
  // beforeId が null の場合は destStatus カラムの末尾に配置する。
  const moveTask = useCallback(async (activeId, destStatus, beforeId) => {
    const previous = allTasks
    const sourceTask = previous.find(t => t.id === activeId)
    if (!sourceTask) return

    const destTasks = previous
      .filter(t => t.status === destStatus && t.id !== activeId)
      .sort(bySortOrder)

    let destIndex
    if (beforeId == null) {
      destIndex = destTasks.length
    } else {
      const idx = destTasks.findIndex(t => t.id === beforeId)
      destIndex = idx === -1 ? destTasks.length : idx
    }

    const movedTask = { ...sourceTask, status: destStatus }
    const newDestTasks = [
      ...destTasks.slice(0, destIndex),
      movedTask,
      ...destTasks.slice(destIndex),
    ]

    const items = newDestTasks.map((t, idx) => ({
      id: t.id,
      status: destStatus,
      sortOrder: idx,
    }))

    if (sourceTask.status !== destStatus) {
      const newSourceTasks = previous
        .filter(t => t.status === sourceTask.status && t.id !== activeId)
        .sort(bySortOrder)
      newSourceTasks.forEach((t, idx) => {
        items.push({ id: t.id, status: sourceTask.status, sortOrder: idx })
      })
    }

    const itemMap = new Map(items.map(i => [i.id, i]))
    const optimistic = previous.map(t => {
      const it = itemMap.get(t.id)
      return it ? { ...t, status: it.status, sortOrder: it.sortOrder } : t
    })
    setAllTasks(optimistic)

    try {
      const serverTasks = await apiReorderTasks(items)
      if (Array.isArray(serverTasks)) {
        setAllTasks(serverTasks)
      }
    } catch (e) {
      setAllTasks(previous)
      throw e
    }
  }, [allTasks])

  const tasks = useMemo(() => {
    const filtered = allTasks
      .filter(t => statusFilter === 'all' || t.status === statusFilter)
      .filter(t => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        )
      })
    return [...filtered].sort(bySortOrder)
  }, [allTasks, searchQuery, statusFilter])

  const contextValue = useMemo(() => ({
    tasks, loading, error,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    addTask, updateTask, deleteTask, moveTask,
  }), [tasks, loading, error, searchQuery, statusFilter, addTask, updateTask, deleteTask, moveTask])

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  return useContext(TaskContext)
}
