import { useState, useEffect, useRef } from 'react'

const CHECK_INTERVAL_MS = 30000 // 30秒ごとにAPI死活確認
const API_TIMEOUT_MS    = 5000  // 5秒でタイムアウト

// 状態の種類
// 'online'   : ネットワーク・API ともに正常
// 'offline'  : ネットワーク自体が切断
// 'api-down' : ネットワークはあるがAPIサーバーに届かない（バックエンド未起動・別Wi-Fi等）
// 'checking' : 初回確認中

async function checkApi() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const res = await fetch('/api/tasks', { signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function useConnectionStatus() {
  const [status, setStatus] = useState('checking')
  const timerRef = useRef(null)

  async function update() {
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }
    const apiOk = await checkApi()
    setStatus(apiOk ? 'online' : 'api-down')
  }

  useEffect(() => {
    update()

    timerRef.current = setInterval(update, CHECK_INTERVAL_MS)

    window.addEventListener('online',  update)
    window.addEventListener('offline', update)

    return () => {
      clearInterval(timerRef.current)
      window.removeEventListener('online',  update)
      window.removeEventListener('offline', update)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return status
}
