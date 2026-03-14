import { useState, useCallback } from 'react'
import confetti from 'canvas-confetti'

const SEGMENT_COLORS = ['#faa9e2', '#d2fefe', '#bdaefe']
const LABEL_COLOR = '#3b1a5a'
const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = CENTER - 12
const HUB_RADIUS = 24

interface Props {
  rewards: string[]
  onRewardSelected?: (reward: string) => void
  demo?: boolean
}

export default function RewardWheel({ rewards, onRewardSelected, demo = false }: Props) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [wonReward, setWonReward] = useState<string | null>(null)

  const items = rewards.length > 0 ? rewards : ['Add rewards!']
  const segAngle = (2 * Math.PI) / items.length

  const closeModal = useCallback(() => setWonReward(null), [])

  function spin() {
    if (spinning || items.length === 0) return
    setWonReward(null)
    setSpinning(true)

    const duration = 3500
    const extraSpins = 5 + Math.random() * 2
    const targetRotation = rotation + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI

    const startTime = performance.now()
    const startRotation = rotation

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3)
    }

    function animate() {
      const elapsed = (performance.now() - startTime) / duration
      const t = Math.min(elapsed, 1)
      const eased = easeOutCubic(t)
      const currentRotation = startRotation + targetRotation * eased
      setRotation(currentRotation)

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        const finalAngle = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const idx = Math.floor(finalAngle / segAngle) % items.length
        const winner = items[idx]
        setWonReward(winner)
        onRewardSelected?.(winner)
        if (!demo) {
          confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } })
        }
      }
    }
    requestAnimationFrame(animate)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Pointer arrow - fixed on the right */}
        <div
          className="absolute top-1/2 right-0 z-10 -translate-y-1/2 translate-x-full"
          aria-hidden
        >
          <svg width="28" height="28" viewBox="0 0 28 28" className="drop-shadow-md">
            <path
              d="M0 14 L22 6 L22 22 Z"
              fill="#FF8A00"
              stroke="#e67a00"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Wheel container */}
        <div
          className="relative overflow-hidden rounded-full shadow-xl border-4 border-white"
          style={{
            width: SIZE,
            height: SIZE,
            transform: `rotate(${rotation}rad)`,
            transition: spinning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <g transform={`translate(${CENTER}, ${CENTER})`}>
              {items.map((label, i) => {
                const start = i * segAngle
                const end = start + segAngle
                const midAngle = start + segAngle / 2
                const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]

                const x1 = RADIUS * Math.cos(start)
                const y1 = RADIUS * Math.sin(start)
                const x2 = RADIUS * Math.cos(end)
                const y2 = RADIUS * Math.sin(end)

                const path = `M 0 0 L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`

                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={(RADIUS - 20) * Math.cos(midAngle)}
                      y={(RADIUS - 20) * Math.sin(midAngle)}
                      fill={LABEL_COLOR}
                      fontSize={Math.min(13, 72 / items.length + 6)}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${(midAngle * 180) / Math.PI + 90} ${(RADIUS - 20) * Math.cos(midAngle)} ${(RADIUS - 20) * Math.sin(midAngle)})`}
                    >
                      {label.length > 10 ? label.slice(0, 9) + '…' : label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Center hub */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-inner flex items-center justify-center"
          style={{
            width: HUB_RADIUS * 2,
            height: HUB_RADIUS * 2,
            backgroundColor: '#6C63FF',
          }}
        >
          <span className="text-white text-lg font-black">★</span>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning || rewards.length === 0}
        className="bg-[#FF8A00] hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-md transition-all active:scale-95"
      >
        {spinning ? 'Spinning…' : 'SPIN!'}
      </button>

      {/* Reward modal */}
      {wonReward && (
        <RewardModal reward={wonReward} onClose={closeModal} />
      )}
    </div>
  )
}

function RewardModal({ reward, onClose }: { reward: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 transition-opacity duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <span className="text-xl font-bold leading-none">×</span>
        </button>
        <div className="text-center pt-2">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-sm text-gray-500 mb-1">You won:</p>
          <p className="text-2xl font-black text-[#3b1a5a]">{reward}</p>
        </div>
      </div>
    </div>
  )
}
