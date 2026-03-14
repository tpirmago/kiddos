import { useNavigate } from 'react-router-dom'

interface Props {
  title?: string
  backTo?: string
  right?: React.ReactNode
}

export default function NavBar({ title, backTo, right }: Props) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-[900px] mx-auto px-4 py-3 flex items-center gap-3 min-h-[56px]">
        {backTo ? (
          <button
            onClick={() => navigate(backTo)}
            className="text-[#6C63FF] font-semibold text-sm flex items-center gap-1"
          >
            ← Back
          </button>
        ) : (
          <button onClick={() => navigate('/')} className="font-black text-[#6C63FF] text-lg">
            KiddoQuest
          </button>
        )}

        {title && (
          <h1 className="flex-1 text-center font-bold text-gray-800 text-lg">{title}</h1>
        )}

        <div className="ml-auto flex items-center gap-2">
          {right}
        </div>
      </div>
    </header>
  )
}
