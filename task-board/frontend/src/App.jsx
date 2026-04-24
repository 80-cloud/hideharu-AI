import { TaskProvider } from './context/TaskContext'
import Header from './components/Header'
import Board from './components/Board'

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Board />
      </div>
    </TaskProvider>
  )
}

export default App
