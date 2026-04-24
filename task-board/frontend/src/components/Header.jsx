function Header() {
  const today = new Date()
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${days[today.getDay()]}）`

  return (
    <header className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4">
      <h1 className="text-xl font-bold">タスク管理ボード</h1>
      <p className="text-sm opacity-80">{dateStr}</p>
    </header>
  )
}

export default Header
