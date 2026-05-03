import { useState } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { useTheme } from '../context/ThemeContext'
import TaskFormModal from './TaskFormModal'

const STATUS_BUTTONS = [
  { value: 'all',   label: 'すべて' },
  { value: 'todo',  label: 'やること' },
  { value: 'doing', label: '進行中' },
  { value: 'done',  label: '完了' },
]

function Header() {
  const today = new Date()
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${days[today.getDay()]}）`

  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useTaskContext()
  const { isDark, toggleTheme } = useTheme()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <header className="bg-blue-600 dark:bg-gray-800 text-white px-4 md:px-6 py-3 md:py-4 shadow-md transition-colors duration-200">
        {/* 1行目: タイトル + 日付 + ボタン群 */}
        <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
          <h1 className="text-lg md:text-xl font-bold whitespace-nowrap">タスク管理ボード</h1>
          <p className="text-xs md:text-sm opacity-80 whitespace-nowrap">{dateStr}</p>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 text-white min-h-[44px] min-w-[72px]"
              aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDark ? '☀ ライト' : '☾ ダーク'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 md:px-4 py-2 bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 text-xs md:text-sm font-bold rounded-md hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors min-h-[44px]"
            >
              + 新規
            </button>
          </div>
        </div>

        {/* 2行目: 検索 + フィルター */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="タスクを検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-2 rounded-md text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:placeholder-gray-400 text-sm w-full sm:w-48 md:w-56 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-500 min-h-[44px]"
          />
          <div className="flex flex-wrap gap-1 md:gap-2">
            {STATUS_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors min-h-[44px] ${
                  statusFilter === btn.value
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100'
                    : 'bg-blue-500 dark:bg-gray-700 text-white hover:bg-blue-400 dark:hover:bg-gray-600'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {showModal && <TaskFormModal onClose={() => setShowModal(false)} />}
    </>
  )
}

export default Header
