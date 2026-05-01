import { useState } from 'react'
import { useTaskContext } from '../context/TaskContext'

function TaskFormModal({ onClose, task = null, initialStatus = 'todo' }) {
  const { addTask, updateTask } = useTaskContext()
  const isEdit = task !== null

  const [form, setForm] = useState(isEdit ? {
    title:       task.title,
    description: task.description ?? '',
    priority:    task.priority ?? 'medium',
    dueDate:     task.dueDate ?? '',
    status:      task.status,
  } : {
    title: '', description: '', priority: 'medium', dueDate: '', status: initialStatus,
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setFormError('タイトルは必須です。')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const data = {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
        dueDate:     form.dueDate || null,
        status:      form.status,
      }
      if (isEdit) {
        await updateTask(task.id, data)
      } else {
        await addTask(data)
      }
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message
      setFormError(msg ?? 'ネットワークエラーが発生しました。バックエンドが起動しているか確認してください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? 'タスクを編集' : '新規タスクを登録'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              placeholder="タスクのタイトルを入力"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              placeholder="詳細説明（任意）"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">やること</option>
                <option value="doing">進行中</option>
                <option value="done">完了</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (isEdit ? '更新中...' : '登録中...') : (isEdit ? '更新する' : '登録する')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskFormModal
