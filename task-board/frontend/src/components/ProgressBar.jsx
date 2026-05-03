function ProgressBar({ tasks }) {
  const total = tasks.length
  const done  = tasks.filter(t => t.status === 'done').length
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100)

  if (total === 0) {
    return (
      <div className="bg-blue-700 dark:bg-gray-700 px-4 md:px-6 py-2 transition-colors duration-200">
        <p className="text-xs text-blue-200 dark:text-gray-400">タスクがまだありません</p>
      </div>
    )
  }

  const barColor =
    pct === 100 ? 'bg-green-400' :
    pct >= 60   ? 'bg-blue-400'  :
    pct >= 30   ? 'bg-yellow-400': 'bg-red-400'

  return (
    <div className="bg-blue-700 dark:bg-gray-700 px-4 md:px-6 py-2 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-blue-900 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-blue-100 dark:text-gray-300 whitespace-nowrap font-medium">
          {done} / {total} 完了（{pct}%）
        </span>
      </div>
    </div>
  )
}

export default ProgressBar
