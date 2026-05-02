// "2026-04-25" → "4/25" に変換
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const month = parseInt(parts[1], 10)
  const day   = parseInt(parts[2], 10)
  if (isNaN(month) || isNaN(day)) return dateStr
  return `${month}/${day}`
}

// 今日より前の日付かどうか判定（期限切れ = true）
export function isOverdue(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr)
  if (isNaN(due.getTime())) return false
  return due < today
}
