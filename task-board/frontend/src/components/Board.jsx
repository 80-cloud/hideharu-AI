import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { useTaskContext } from '../context/TaskContext'
import Column from './Column'

const COLUMNS = [
  { status: 'todo',  label: 'やること' },
  { status: 'doing', label: '進行中' },
  { status: 'done',  label: '完了' },
]

function Board() {
  const { tasks, loading, error, statusFilter, updateTask } = useTaskContext()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">読み込み中...</div>
  if (error)   return <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>

  const visibleColumns = statusFilter === 'all'
    ? COLUMNS
    : COLUMNS.filter(col => col.status === statusFilter)

  async function handleDragEnd({ active, over }) {
    if (!over) return

    const draggedTask = tasks.find(t => t.id === active.id)
    if (!draggedTask) return

    const STATUSES = ['todo', 'doing', 'done']
    let targetStatus

    if (STATUSES.includes(over.id)) {
      targetStatus = over.id
    } else {
      const overTask = tasks.find(t => t.id === over.id)
      targetStatus = overTask?.status
    }

    if (targetStatus && draggedTask.status !== targetStatus) {
      try {
        await updateTask(draggedTask.id, {
          title:       draggedTask.title,
          description: draggedTask.description,
          priority:    draggedTask.priority,
          dueDate:     draggedTask.dueDate,
          status:      targetStatus,
        })
      } catch {
        console.error('ドラッグ&ドロップによるステータス更新に失敗しました')
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <main className="flex gap-4 p-6 overflow-x-auto items-start">
        {visibleColumns.map(col => (
          <Column
            key={col.status}
            label={col.label}
            status={col.status}
            tasks={tasks.filter(t => t.status === col.status)}
          />
        ))}
      </main>
    </DndContext>
  )
}

export default Board
