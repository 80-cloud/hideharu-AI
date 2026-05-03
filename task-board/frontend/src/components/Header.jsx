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
      <header className="bg-blue-600 dark:bg-gray-800 text-white px-6 py-4 shadow-md transition-colors duration-200">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-xl font-bold">タスク管理ボード</h1>
          <p className="text-sm opacity-80">{dateStr}</p>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 text-white"
              aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDark ? '☀ ライト' : '☾ ダーク'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-1.5 bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 text-sm font-bold rounded-md hover:bg-blue-50 dark:hover:bg-gray-500 transition-colors"
            >
              + 新規
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="タスクを検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-md text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:placeholder-gray-400 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-500"
          />
          <div className="flex gap-2">
            {STATUS_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
