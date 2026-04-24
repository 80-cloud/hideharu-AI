// "2026-04-25" → "4/25" に変換
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [, m, d] = dateStr.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

// 今日より前の日付かどうか判定（期限切れ = true）
export function isOverdue(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}
