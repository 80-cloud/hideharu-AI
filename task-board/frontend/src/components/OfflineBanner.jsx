import { useConnectionStatus } from '../hooks/useConnectionStatus'

const BANNER_CONFIG = {
  offline: {
    bg:   'bg-yellow-500',
    text: 'ネットワーク切断中 — Wi-Fiの接続を確認してください',
  },
  'api-down': {
    bg:   'bg-red-500',
    text: 'サーバーに接続できません — バックエンドが起動しているか、MacとiPadが同じWi-Fiにいるか確認してください',
  },
}

function OfflineBanner() {
  const status = useConnectionStatus()
  const config = BANNER_CONFIG[status]

  if (!config) return null

  return (
    <div className={`${config.bg} text-white text-xs md:text-sm text-center py-2 px-4 font-medium`}>
      {config.text}
    </div>
  )
}

export default OfflineBanner
