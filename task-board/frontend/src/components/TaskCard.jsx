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

function TaskCard({ task, dragDisabled = false }) {
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
  } = useSortable({ id: task.id, disabled: dragDisabled })

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

  // touchAction: 'none' は iOS Safari で長押しドラッグ前にページがスクロールするのを防ぐ。
  // 並び替えビュー中はドラッグ無効化のため通常のスクロールを許可する。
  const handleStyle = dragDisabled
    ? { touchAction: 'auto' }
    : { touchAction: 'none' }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm border-l-4 ${borderColor} ${isDragging ? 'opacity-50 shadow-lg' : ''} transition-colors duration-200`}
      >
        {/* ドラッグハンドル */}
        <div
          ref={setActivatorNodeRef}
          {...(dragDisabled ? {} : listeners)}
          {...attributes}
          style={handleStyle}
          className={`flex justify-center py-2 select-none ${
            dragDisabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          aria-label={dragDisabled ? 'ドラッグ無効（並び替えビュー中）' : 'カードをドラッグして並び替え（タッチデバイスは長押し）'}
          role="button"
          tabIndex={dragDisabled ? -1 : 0}
        >
          {dragDisabled ? '✕ 並び替え中はドラッグ不可 ✕' : '⠿⠿⠿'}
        </div>

        <div className="px-3 pb-3">
          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1 break-words">{task.title}</p>

          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-3">{task.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priority.className}`}>
              {priority.label}
            </span>

            {task.dueDate && (
              <span className={`text-xs ${overdue ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                {overdue && '⚠ 期限切れ '}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {cardError && (
            <p className="text-xs text-red-500 dark:text-red-400 mb-1">{cardError}</p>
          )}

          <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100 dark:border-gray-600">
            {nextStatus && (
              <button
                onClick={handleStatusChange}
                disabled={moving}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium disabled:opacity-40 truncate"
              >
                {moving ? '移動中...' : `→ ${nextStatus.label}`}
              </button>
            )}

            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300"
              >
                編集
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 disabled:opacity-40"
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
