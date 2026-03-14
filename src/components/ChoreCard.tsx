interface Props {
  title: string
  completed: boolean
  onComplete: () => void
  onDelete?: () => void
}

export default function ChoreCard({ title, completed, onComplete, onDelete }: Props) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3 transition-all ${
      completed ? 'border-green-200 bg-green-50' : 'border-gray-100'
    }`}>
      <span className="text-2xl">{completed ? '✅' : '📋'}</span>
      <p className={`flex-1 font-medium text-base ${completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {title}
      </p>
      {completed && <span className="text-green-500 font-semibold text-sm">+1 ⭐</span>}
      {!completed && (
        <button
          onClick={onComplete}
          className="bg-[#6C63FF] hover:bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          Done!
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg p-1 ml-1"
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </div>
  )
}
