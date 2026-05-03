import { TaskProvider } from './context/TaskContext'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import Board from './components/Board'

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <Board />
        </div>
      </TaskProvider>
    </ThemeProvider>
  )
}

export default App
