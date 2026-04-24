import TaskCard from './TaskCard'

function Column({ label, tasks }) {
  return (
    <div className="bg-gray-200 rounded-lg w-72 flex-shrink-0 p-3 flex flex-col gap-2">
      <div className="flex justify-between items-center pb-2">
        <h2 className="font-bold text-gray-800">{label}</h2>
        <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 min-h-10">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export default Column
