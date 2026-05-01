import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import TaskFormModal from './TaskFormModal'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function Column({ label, status, tasks }) {
  const [showModal, setShowModal] = useState(false)
  const [sortKey, setSortKey] = useState(null)

  const { setNodeRef } = useDroppable({ id: status })

  const sortedTasks = useMemo(() => {
    if (!sortKey) return tasks
    return [...tasks].sort((a, b) => {
      if (sortKey === 'priority') {
        return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
      }
      if (sortKey === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      }
      return 0
    })
  }, [tasks, sortKey])

  function toggleSort(key) {
    setSortKey(prev => (prev === key ? null : key))
  }

  return (
    <>
      <div className="bg-gray-200 rounded-lg w-72 flex-shrink-0 p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center pb-1">
          <h2 className="font-bold text-gray-800">{label}</h2>
          <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            {tasks.length}
          </span>
        </div>

        <div className="flex gap-1 pb-1">
          <button
            onClick={() => toggleSort('priority')}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              sortKey === 'priority' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
            }`}
          >
            優先度順
          </button>
          <button
            onClick={() => toggleSort('dueDate')}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              sortKey === 'dueDate' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
            }`}
          >
            期限順
          </button>
        </div>

        <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex flex-col gap-2 min-h-10">
            {sortedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        <button
          onClick={() => setShowModal(true)}
          className="mt-1 w-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-md py-1.5 transition-colors text-left px-2"
        >
          ＋ タスク追加
        </button>
      </div>

      {showModal && (
        <TaskFormModal initialStatus={status} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

export default Column
