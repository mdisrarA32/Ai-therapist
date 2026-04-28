'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/contexts/session-context'
import { Container } from '@/components/ui/container'
import { ArrowLeft } from 'lucide-react'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface Tile {
  id: string
  emoji: string
  state: 'down' | 'up' | 'matched'
}

const EMOJI_POOLS = {
  Easy: ['🌸', '🌈', '🦋', '🌙', '⭐', '🐢'],
  Medium: ['🌸', '🌈', '🦋', '🌙', '⭐', '🐢', '🍀', '🎈'],
  Hard: ['🌸', '🌈', '🦋', '🌙', '⭐', '🐢', '🍀', '🎈', '🌺', '🦄']
}

export default function MemoryTilesPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useSession()

  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [tiles, setTiles] = useState<Tile[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [pairs, setPairs] = useState(0)
  const [time, setTime] = useState(0)
  const [isWin, setIsWin] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !isWin) {
      interval = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, isWin])

  // Init game
  const initGame = (diff: Difficulty = difficulty) => {
    const emojis = EMOJI_POOLS[diff]
    const pairList = [...emojis, ...emojis]
    const shuffled = pairList.sort(() => Math.random() - 0.5)
    
    setTiles(shuffled.map((emoji, i) => ({
      id: `${i}-${emoji}`,
      emoji,
      state: 'down'
    })))
    setFlippedIndices([])
    setMoves(0)
    setPairs(0)
    setTime(0)
    setIsWin(false)
    setIsTimerRunning(false)
    setIsLocked(false)
  }

  useEffect(() => {
    initGame('Medium')
  }, [])

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff)
    initGame(diff)
  }

  const handleTileClick = (index: number) => {
    if (isLocked || tiles[index].state !== 'down') return

    if (!isTimerRunning) {
      setIsTimerRunning(true)
    }

    const newTiles = [...tiles]
    newTiles[index].state = 'up'
    setTiles(newTiles)

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setIsLocked(true)
      setMoves(m => m + 1)

      const [first, second] = newFlipped
      if (tiles[first].emoji === tiles[second].emoji) {
        setTimeout(() => {
          setTiles(prev => prev.map((t, i) => 
            i === first || i === second ? { ...t, state: 'matched' } : t
          ))
          setPairs(p => {
            const newPairs = p + 1
            if (newPairs === EMOJI_POOLS[difficulty].length) {
              setIsWin(true)
              setIsTimerRunning(false)
            }
            return newPairs
          })
          setFlippedIndices([])
          setIsLocked(false)
        }, 800)
      } else {
        setTimeout(() => {
          setTiles(prev => prev.map((t, i) => 
            i === first || i === second ? { ...t, state: 'down' } : t
          ))
          setFlippedIndices([])
          setIsLocked(false)
        }, 800)
      }
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading || !isAuthenticated) return null

  const columns = difficulty === 'Easy' ? 3 : 4

  return (
    <div className="min-h-screen bg-[#f0f6fc] pt-24 pb-12">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes gentlePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse-gentle {
          animation: gentlePulse 0.4s ease-out forwards;
        }
      `}</style>
      
      <Container>
        <div className="max-w-[480px] mx-auto">
          {/* Top Navigation */}
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-[#2563a8] font-medium mb-6 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>

          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-medium text-[#1e3a5f] mb-1">Memory Tiles</h1>
            <p className="text-[13px] text-slate-500 mb-4">Find all the matching pairs. Take your time.</p>
            <div className="inline-flex items-center justify-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 mb-4">
              <span className="text-sm font-medium text-[#1e3a5f]">
                🧩 {pairs} pairs found · {moves} moves
              </span>
            </div>
            
            {/* Difficulty Selector */}
            <div className="flex justify-center gap-2 mb-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border-none cursor-pointer ${
                    difficulty === diff 
                      ? 'bg-[#2563a8] text-white' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Game Container */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div 
              className="grid gap-2 mx-auto justify-center"
              style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                maxWidth: 'fit-content'
              }}
            >
              {tiles.map((tile, i) => (
                <div
                  key={tile.id}
                  onClick={() => handleTileClick(i)}
                  className={`perspective-1000 relative select-none ${
                    tile.state === 'down' ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  style={{
                    width: `min(calc((480px - 48px) / ${columns}), 90px)`,
                    height: `min(calc((480px - 48px) / ${columns}), 90px)`
                  }}
                >
                  <div 
                    className={`w-full h-full transition-transform duration-400 transform-style-3d relative ${
                      tile.state !== 'down' ? 'rotate-y-180' : ''
                    } ${tile.state === 'matched' ? 'animate-pulse-gentle' : ''}`}
                    style={{ transitionDuration: '400ms' }}
                  >
                    {/* Front (face-down) */}
                    <div className="absolute inset-0 bg-[#2563a8] rounded-xl shadow-sm backface-hidden" />
                    
                    {/* Back (face-up) */}
                    <div className={`absolute inset-0 rounded-xl shadow-sm backface-hidden rotate-y-180 flex items-center justify-center text-[28px] ${
                      tile.state === 'matched' ? 'bg-[#d1fae5]' : 'bg-white border border-slate-100'
                    }`}>
                      {tile.emoji}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Win State Overlay */}
            {isWin && (
              <div className="absolute inset-0 bg-[rgba(255,255,255,0.92)] rounded-2xl flex flex-col items-center justify-center z-10 shadow-sm border border-slate-100 backdrop-blur-[2px]">
                <div className="text-[24px] font-medium text-[#1e3a5f] mb-2">🎉 Well done!</div>
                <div className="text-slate-500 mb-6">{moves} moves · {formatTime(time)} time</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => initGame(difficulty)}
                    className="px-6 py-2.5 bg-[#2563a8] text-white rounded-lg font-medium hover:bg-[#1e4f86] transition-colors shadow-sm border-none cursor-pointer"
                  >
                    Play Again
                  </button>
                  {difficulty !== 'Hard' && (
                    <button
                      onClick={() => handleDifficultyChange(difficulty === 'Easy' ? 'Medium' : 'Hard')}
                      className="px-6 py-2.5 bg-white text-[#2563a8] border border-[#2563a8] rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                    >
                      Try Harder
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Session Time</span>
              <span className="text-lg font-medium text-[#1e3a5f]">{formatTime(time)}</span>
            </div>
            
            <button
              onClick={() => initGame(difficulty)}
              className="px-6 py-2 bg-[#2563a8] text-white rounded-lg font-medium hover:bg-[#1e4f86] transition-colors shadow-sm min-h-[44px] border-none cursor-pointer"
            >
              New Game
            </button>
          </div>
          
        </div>
      </Container>
    </div>
  )
}
