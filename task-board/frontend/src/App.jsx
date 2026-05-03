import { TaskProvider, useTaskContext } from './context/TaskContext'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import Board from './components/Board'
import ProgressBar from './components/ProgressBar'
import OfflineBanner from './components/OfflineBanner'

function AppContent() {
  const { tasks } = useTaskContext()
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <OfflineBanner />
      <Header />
      <ProgressBar tasks={tasks} />
      <Board />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  )
}

export default App
