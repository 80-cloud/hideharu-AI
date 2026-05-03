import { useOnlineStatus } from '../hooks/useOnlineStatus'

function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="bg-yellow-500 text-white text-sm text-center py-2 px-4 font-medium">
      オフライン中 — 変更はオンライン復帰後に同期されます
    </div>
  )
}

export default OfflineBanner
