import { useTaskContext } from '../context/TaskContext'
import Column from './Column'

const COLUMNS = [
  { status: 'todo',  label: 'やること' },
  { status: 'doing', label: '進行中' },
  { status: 'done',  label: '完了' },
]

function Board() {
  const { tasks, loading, error } = useTaskContext()

  if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>
  if (error)   return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <main className="flex gap-4 p-6 overflow-x-auto items-start">
      {COLUMNS.map(col => (
        <Column
          key={col.status}
          label={col.label}
          tasks={tasks.filter(t => t.status === col.status)}
        />
      ))}
    </main>
  )
}

export default Board
