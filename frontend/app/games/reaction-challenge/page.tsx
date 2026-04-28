'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/contexts/session-context'
import { Container } from '@/components/ui/container'
import { ArrowLeft } from 'lucide-react'

type GameState = 'IDLE' | 'WAITING' | 'TARGET_VISIBLE' | 'RESULT' | 'MISS'

export default function ReactionChallengePage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useSession()

  const [gameState, setGameState] = useState<GameState>('IDLE')
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [avgTime, setAvgTime] = useState<number | null>(null)
  const [roundsCount, setRoundsCount] = useState(0)
  const [missesCount, setMissesCount] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  
  const [lastTime, setLastTime] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const [tooEarly, setTooEarly] = useState(false)
  
  const [targetProps, setTargetProps] = useState({ size: 60, x: 50, y: 50 })
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const missTimerRef = useRef<NodeJS.Timeout | null>(null)
  const earlyMessageTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  
  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (missTimerRef.current) clearTimeout(missTimerRef.current)
      if (earlyMessageTimerRef.current) clearTimeout(earlyMessageTimerRef.current)
    }
  }, [])

  const startWaitPhase = () => {
    setGameState('WAITING')
    setTooEarly(false)
    setIsNewBest(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (missTimerRef.current) clearTimeout(missTimerRef.current)

    const delay = 1500 + Math.random() * 3000 // 1500 to 4500ms
    timerRef.current = setTimeout(showTarget, delay)
  }

  const showTarget = () => {
    const size = 60 + Math.random() * 40
    // x and y from 5% to 80% to ensure it stays within bounds
    const x = 5 + Math.random() * 75
    const y = 5 + Math.random() * 75
    
    setTargetProps({ size, x, y })
    setGameState('TARGET_VISIBLE')
    startTimeRef.current = performance.now()
    
    missTimerRef.current = setTimeout(() => {
      handleMiss()
    }, 3000)
  }

  const handleMiss = () => {
    setGameState('MISS')
    setRoundsCount(r => r + 1)
    setMissesCount(m => m + 1)
  }

  const handleContainerClick = () => {
    if (gameState === 'WAITING') {
      setTooEarly(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (earlyMessageTimerRef.current) clearTimeout(earlyMessageTimerRef.current)
      
      earlyMessageTimerRef.current = setTimeout(() => {
        setTooEarly(false)
      }, 1500)
      
      const delay = 1500 + Math.random() * 3000
      timerRef.current = setTimeout(showTarget, delay)
    }
  }

  const handleTargetClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (gameState !== 'TARGET_VISIBLE') return

    const endTime = performance.now()
    const reactionTime = Math.round(endTime - startTimeRef.current)
    
    if (missTimerRef.current) clearTimeout(missTimerRef.current)
    
    const newTimes = [...reactionTimes, reactionTime]
    setReactionTimes(newTimes)
    
    const newAvg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length)
    setAvgTime(newAvg)
    
    let isBest = false
    if (bestTime === null || reactionTime < bestTime) {
      setBestTime(reactionTime)
      isBest = true
    }
    
    setIsNewBest(isBest)
    setLastTime(reactionTime)
    setRoundsCount(r => r + 1)
    setGameState('RESULT')
  }

  if (loading || !isAuthenticated) return null

  const getResultColorAndText = (time: number) => {
    if (time <= 250) return { color: '#16a34a', text: '⚡ Incredible!' }
    if (time <= 400) return { color: '#2563a8', text: '🎯 Great!' }
    if (time <= 600) return { color: '#6b7280', text: '👍 Good' }
    return { color: '#9ca3af', text: '🐢 Keep practicing' }
  }

  return (
    <div className="min-h-screen bg-[#f0f6fc] pt-24 pb-12">
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
            <h1 className="text-[20px] font-medium text-[#1e3a5f] mb-1">Reaction Challenge</h1>
            <p className="text-[13px] text-slate-500 mb-4">Tap the circle as fast as you can when it appears.</p>
            <div className="inline-flex items-center justify-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
              <span className="text-sm font-medium text-[#1e3a5f]">
                ⚡ Best: {bestTime ? `${bestTime}ms` : '—'} · Avg: {avgTime ? `${avgTime}ms` : '—'} · Rounds: {roundsCount}
              </span>
            </div>
          </div>

          {/* Game Container */}
          <div 
            className="relative w-full min-h-[60vh] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden select-none cursor-pointer"
            onClick={handleContainerClick}
          >
            {gameState === 'IDLE' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
                <p className="text-[#1e3a5f] font-medium mb-6 text-lg">Tap 'Start' to begin</p>
                <button
                  onClick={(e) => { e.stopPropagation(); startWaitPhase() }}
                  className="px-8 py-3 bg-[#2563a8] text-white rounded-lg font-medium hover:bg-[#1e4f86] transition-colors shadow-sm min-h-[44px] text-lg border-none cursor-pointer"
                >
                  Start
                </button>
              </div>
            )}

            {gameState === 'WAITING' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-slate-500 text-[16px]">Get ready...</p>
                {tooEarly && (
                  <p className="text-[#ef4444] font-medium mt-4 absolute top-[25%] animate-pulse">Too early! Wait for the circle.</p>
                )}
              </div>
            )}

            {gameState === 'TARGET_VISIBLE' && (
              <div
                onClick={handleTargetClick}
                onTouchStart={handleTargetClick}
                className="absolute flex items-center justify-center rounded-full bg-[#2563a8] border-[3px] border-white shadow-md cursor-pointer"
                style={{
                  width: `${targetProps.size}px`,
                  height: `${targetProps.size}px`,
                  left: `${targetProps.x}%`,
                  top: `${targetProps.y}%`,
                  animation: 'appear 0.2s ease-out forwards'
                }}
              >
                <span className="text-white text-[14px] font-semibold">TAP!</span>
              </div>
            )}

            {gameState === 'RESULT' && lastTime && (
              <div className="absolute inset-0 flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="text-[32px] font-bold text-[#1e3a5f] mb-2">{lastTime}ms</div>
                <div className="text-[20px] font-medium mb-4" style={{ color: getResultColorAndText(lastTime).color }}>
                  {getResultColorAndText(lastTime).text}
                </div>
                {isNewBest && (
                  <div className="bg-[#fef3c7] text-[#b45309] px-3 py-1 rounded-full text-sm font-bold mb-6 flex items-center gap-1 shadow-sm border border-[#fde68a]">
                    🏆 New best!
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); startWaitPhase() }}
                  className="px-8 py-3 bg-[#2563a8] text-white rounded-lg font-medium hover:bg-[#1e4f86] transition-colors shadow-sm min-h-[44px] border-none cursor-pointer"
                >
                  Next Round
                </button>
              </div>
            )}

            {gameState === 'MISS' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center cursor-default" onClick={(e) => e.stopPropagation()}>
                <p className="text-slate-500 mb-6 text-lg">Missed it! The circle disappeared.</p>
                <button
                  onClick={(e) => { e.stopPropagation(); startWaitPhase() }}
                  className="px-8 py-3 bg-[#2563a8] text-white rounded-lg font-medium hover:bg-[#1e4f86] transition-colors shadow-sm min-h-[44px] border-none cursor-pointer"
                >
                  Next Round
                </button>
              </div>
            )}
          </div>

          {/* Session Stats Below Game */}
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Best Time</span>
              <span className="text-lg font-medium text-[#1e3a5f]">{bestTime ? `${bestTime}ms` : '—'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average</span>
              <span className="text-lg font-medium text-[#1e3a5f]">{avgTime ? `${avgTime}ms` : '—'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rounds</span>
              <span className="text-lg font-medium text-[#1e3a5f]">{roundsCount}</span>
            </div>
          </div>
          
          <style>{`
            @keyframes appear {
              from { transform: scale(0); }
              to { transform: scale(1); }
            }
          `}</style>
        </div>
      </Container>
    </div>
  )
}
