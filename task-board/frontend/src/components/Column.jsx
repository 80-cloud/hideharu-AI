import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import TaskFormModal from './TaskFormModal'
import CircularProgress from './CircularProgress'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function Column({ label, status, tasks, totalTasks = 0 }) {
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

  // 並び替えビュー中はドラッグ操作と並び順が一致しないため、ドラッグを無効化する
  const dragDisabled = sortKey !== null

  return (
    <>
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg w-full flex-shrink-0 p-3 flex flex-col gap-2 transition-colors duration-200">
        <div className="flex justify-between items-center pb-1">
          <h2 className="font-bold text-gray-800 dark:text-gray-100">{label}</h2>
          <div className="flex items-center gap-2">
            <span className="bg-gray-500 dark:bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {tasks.length}
            </span>
            <CircularProgress
              value={totalTasks === 0 ? 0 : (tasks.length / totalTasks) * 100}
              status={status}
            />
          </div>
        </div>

        <div className="flex gap-1 pb-1">
          <button
            onClick={() => toggleSort('priority')}
            className={`text-xs px-2 py-1 rounded transition-colors min-h-[32px] ${
              sortKey === 'priority'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            優先度順
          </button>
          <button
            onClick={() => toggleSort('dueDate')}
            className={`text-xs px-2 py-1 rounded transition-colors min-h-[32px] ${
              sortKey === 'dueDate'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            期限順
          </button>
        </div>

        {dragDisabled && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 px-1">
            並び替えビュー中はドラッグできません（ボタンを再度押すと解除）
          </p>
        )}

        <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[40px]">
            {sortedTasks.map(task => (
              <TaskCard key={task.id} task={task} dragDisabled={dragDisabled} />
            ))}
          </div>
        </SortableContext>

        <button
          onClick={() => setShowModal(true)}
          className="mt-1 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md py-2 min-h-[44px] transition-colors text-left px-2"
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
