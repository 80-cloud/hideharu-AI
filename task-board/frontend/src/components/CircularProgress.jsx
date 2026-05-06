const COLOR_CLASSES = {
  todo:  { stroke: 'stroke-red-400 dark:stroke-red-500',     text: 'text-red-500 dark:text-red-400' },
  doing: { stroke: 'stroke-yellow-400 dark:stroke-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
  done:  { stroke: 'stroke-green-500 dark:stroke-green-400',   text: 'text-green-600 dark:text-green-400' },
}

function CircularProgress({ value, status, size = 44, strokeWidth = 5 }) {
  const safeValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeValue / 100) * circumference
  const colors = COLOR_CLASSES[status] ?? COLOR_CLASSES.todo

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-gray-300 dark:stroke-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.stroke} transition-[stroke-dashoffset] duration-500`}
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${colors.text}`}>
        {Math.round(safeValue)}%
      </span>
    </div>
  )
}

export default CircularProgress
