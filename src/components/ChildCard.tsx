import { useNavigate } from 'react-router-dom'
import type { Child } from '../types/types'
import HeroAvatar from './HeroAvatar'

interface Props {
  child: Child
  stars: number
  onDelete?: (id: string) => void
}

export default function ChildCard({ child, stars, onDelete }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/dashboard/${child.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <HeroAvatar hero={child.hero} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-lg truncate">{child.name}</p>
        <p className="text-sm mt-0.5">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i}>{i < stars ? '⭐' : '⬜'}</span>
          ))}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(child.id) }}
          className="text-gray-300 hover:text-red-400 transition-colors text-xl p-1"
          aria-label="Remove child"
        >
          ✕
        </button>
      )}
    </div>
  )
}
