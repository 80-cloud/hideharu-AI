import { useEffect, useRef } from 'react'

const CHECK_INTERVAL_MS = 60 * 60 * 1000
const NOTIFIED_KEY = 'taskboard_notified'

const notificationAvailable = typeof Notification !== 'undefined'

function getNotifiedIds() {
  try {
    const today = new Date().toDateString()
    const raw = localStorage.getItem(NOTIFIED_KEY)
    const data = raw ? JSON.parse(raw) : {}
    return data.date === today ? new Set(data.ids) : new Set()
  } catch {
    return new Set()
  }
}

function saveNotifiedIds(ids) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify({
      date: new Date().toDateString(),
      ids:  [...ids],
    }))
  } catch {}
}

function checkAndNotify(tasks) {
  if (!notificationAvailable) return                    // iOS Safari 対応
  if (Notification.permission !== 'granted') return

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const notifiedIds = getNotifiedIds()

  tasks.forEach(task => {
    if (task.status === 'done') return
    if (!task.dueDate) return
    if (notifiedIds.has(task.id)) return

    const due = new Date(task.dueDate)
    due.setHours(0, 0, 0, 0)

    let title = ''
    let body  = ''

    if (due < today) {
      title = '期限切れのタスクがあります'
      body  = `「${task.title}」の期限が過ぎています。`
    } else if (due.getTime() === today.getTime()) {
      title = '本日期限のタスクがあります'
      body  = `「${task.title}」は今日が期限です。`
    } else if (due.getTime() === tomorrow.getTime()) {
      title = '明日期限のタスクがあります'
      body  = `「${task.title}」は明日が期限です。`
    }

    if (title) {
      new Notification(title, { body, icon: '/vite.svg', tag: `task-${task.id}` })
      notifiedIds.add(task.id)
    }
  })

  saveNotifiedIds(notifiedIds)
}

export function useReminder(tasks) {
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  useEffect(() => {
    if (!notificationAvailable) return                  // iOS Safari 対応
    if (Notification.permission !== 'granted') return

    checkAndNotify(tasksRef.current)
    const timer = setInterval(() => checkAndNotify(tasksRef.current), CHECK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  async function requestPermission() {
    if (!notificationAvailable) return 'denied'         // iOS Safari 対応
    const result = await Notification.requestPermission()
    if (result === 'granted') checkAndNotify(tasksRef.current)
    return result
  }

  const permission = notificationAvailable ? Notification.permission : 'denied'

  return { permission, requestPermission }
}
