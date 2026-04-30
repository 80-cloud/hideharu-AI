import { useTaskContext } from '../context/TaskContext'

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

  return (
    <header className="bg-blue-600 text-white px-6 py-4">
      <div className="flex items-center gap-4 mb-3">
        <h1 className="text-xl font-bold">タスク管理ボード</h1>
        <p className="text-sm opacity-80">{dateStr}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="タスクを検索..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-md text-gray-800 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <div className="flex gap-2">
          {STATUS_BUTTONS.map(btn => (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === btn.value
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header
