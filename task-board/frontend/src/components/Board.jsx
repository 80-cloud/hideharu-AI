import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { useTaskContext } from '../context/TaskContext'
import Column from './Column'

const COLUMNS = [
  { status: 'todo',  label: 'やること' },
  { status: 'doing', label: '進行中' },
  { status: 'done',  label: '完了' },
]

const STATUSES = ['todo', 'doing', 'done']

function Board() {
  const { tasks, loading, error, statusFilter, moveTask } = useTaskContext()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // iPad / iPhone 等のタッチ環境向け: 250ms の長押しでドラッグ起動。
    // tolerance を広めに取ることで、長押し中の指の微妙な揺れを許容する。
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 10 } })
  )

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">読み込み中...</div>
  if (error)   return <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>

  const visibleColumns = statusFilter === 'all'
    ? COLUMNS
    : COLUMNS.filter(col => col.status === statusFilter)

  async function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return

    let destStatus
    let beforeId = null

    if (STATUSES.includes(over.id)) {
      // カラム droppable に直接ドロップ → 末尾へ
      destStatus = over.id
      beforeId = null
    } else {
      const overTask = tasks.find(t => t.id === over.id)
      if (!overTask) return
      destStatus = overTask.status
      beforeId = over.id
    }

    try {
      await moveTask(active.id, destStatus, beforeId)
    } catch {
      console.error('タスクの並び替えに失敗しました')
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6 items-start">
        {visibleColumns.map(col => (
          <Column
            key={col.status}
            label={col.label}
            status={col.status}
            tasks={tasks.filter(t => t.status === col.status)}
            totalTasks={tasks.length}
          />
        ))}
      </main>
    </DndContext>
  )
}

export default Board
