import { weekEmoji } from '../utils/dateUtils'

interface Props {
  stars: number
  total?: number
}

export default function ProgressBar({ stars, total = 7 }: Props) {
  const emoji = weekEmoji()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
      <p className="text-sm font-semibold text-gray-500 mb-2 text-center">This week's progress</p>
      <div className="flex gap-1.5 justify-center flex-wrap">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`text-2xl transition-transform ${i < stars ? 'scale-110' : 'grayscale opacity-30'}`}>
            {i < stars ? emoji : '⬜'}
          </span>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">{stars} / {total} days</p>
    </div>
  )
}
