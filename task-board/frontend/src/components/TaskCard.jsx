import { formatDate, isOverdue } from '../utils/dateUtils'

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

function TaskCard({ task }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
  const borderColor = BORDER_COLOR[task.priority] ?? BORDER_COLOR.medium
  const overdue = isOverdue(task.dueDate)

  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-l-4 ${borderColor}`}>
      <p className="font-semibold text-gray-800 text-sm mb-1 break-words">{task.title}</p>

      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-1">
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
    </div>
  )
}

export default TaskCard
