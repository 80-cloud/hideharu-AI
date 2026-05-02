import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskContext } from '../context/TaskContext'
import { formatDate, isOverdue } from '../utils/dateUtils'
import TaskFormModal from './TaskFormModal'

const PRIORITY_CONFIG = {
  high:   { label: '高', className: 'bg-red-500 text-white' },
  medium: { label: '中', className: 'bg-yellow-400 text-black' },
  low:    { label: '低', className: 'bg-green-500 text-white' },
}

const BORDER_COLOR = {
  high:   'border-red-500',
  medium: 'border-yellow-400',
  low:    'border-green-500',
}

const STATUS_NEXT = {
  todo:  { value: 'doing', label: '進行中へ' },
  doing: { value: 'done',  label: '完了へ' },
  done:  { value: 'todo',  label: 'やることへ戻す' },
}

function TaskCard({ task }) {
  const { updateTask, deleteTask } = useTaskContext()
  const [showEdit, setShowEdit] = useState(false)
  const [moving, setMoving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [cardError, setCardError] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
  const borderColor = BORDER_COLOR[task.priority] ?? BORDER_COLOR.medium
  const overdue = isOverdue(task.dueDate)
  const nextStatus = STATUS_NEXT[task.status]

  async function handleStatusChange() {
    setMoving(true)
    setCardError('')
    try {
      await updateTask(task.id, {
        title:       task.title,
        description: task.description,
        priority:    task.priority,
        dueDate:     task.dueDate,
        status:      nextStatus.value,
      })
    } catch {
      setCardError('ステータスの更新に失敗しました')
    } finally {
      setMoving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setCardError('')
    try {
      await deleteTask(task.id)
    } catch {
      setCardError('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColor} ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
      >
        {/* ドラッグハンドル */}
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="flex justify-center py-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 select-none"
        >
          ⠿⠿⠿
        </div>

        <div className="px-3 pb-3">
          <p className="font-semibold text-gray-800 text-sm mb-1 break-words">{task.title}</p>

          {task.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-3">{task.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priority.className}`}>
              {priority.label}
            </span>

            {task.dueDate && (
              <span className={`text-xs ${overdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {overdue && '⚠ 期限切れ '}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {cardError && (
            <p className="text-xs text-red-500 mb-1">{cardError}</p>
          )}

          <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100">
            {nextStatus && (
              <button
                onClick={handleStatusChange}
                disabled={moving}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40 truncate"
              >
                {moving ? '移動中...' : `→ ${nextStatus.label}`}
              </button>
            )}

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-40"
              >
                {deleting ? '...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEdit && <TaskFormModal task={task} onClose={() => setShowEdit(false)} />}
    </>
  )
}

export default TaskCard
