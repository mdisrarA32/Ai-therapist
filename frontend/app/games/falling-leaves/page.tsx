'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/contexts/session-context'
import { Container } from '@/components/ui/container'
import { ArrowLeft, Pause, Play } from 'lucide-react'

interface Leaf {
  id: number
  emoji: string
  x: number
  size: number
  duration: number
  popped: boolean
  popX?: number
  popY?: number
}

export default function FallingLeavesPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useSession()

  const [leaves, setLeaves] = useState<Leaf[]>([])
  const [caught, setCaught] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [popTexts, setPopTexts] = useState<{id: number, x: number, y: number}[]>([])
  
  const leafIdRef = useRef(0)
  const timeoutsRef = useRef<Record<number, NodeJS.Timeout>>({})

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    if (isPaused) return
    
    const spawnLeaf = () => {
      setLeaves(prev => {
        const activeLeaves = prev.filter(l => !l.popped)
        if (activeLeaves.length >= 8) return prev

        const emojis = ['🍃', '🍂', '🍁']
        const id = leafIdRef.current++
        const duration = 4000 + Math.random() * 3000
        
        const newLeaf: Leaf = {
          id,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x: 10 + Math.random() * 80,
          size: 24 + Math.random() * 16,
          duration,
          popped: false
        }
        
        timeoutsRef.current[id] = setTimeout(() => {
          setLeaves(current => current.filter(l => l.id !== id))
          delete timeoutsRef.current[id]
        }, duration)

        return [...prev, newLeaf]
      })
    }

    const timeout = setTimeout(spawnLeaf, 2000)
    const interval = setInterval(spawnLeaf, 2000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [isPaused])

  useEffect(() => {
    return () => {
      // Cleanup all timeouts on unmount
      Object.values(timeoutsRef.current).forEach(clearTimeout)
    }
  }, [])

  const handleCatch = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Get coordinates for floating text
    let clientX = 0
    let clientY = 0
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    const containerBounds = document.getElementById('falling-leaves-game')?.getBoundingClientRect()
    const relativeX = containerBounds ? clientX - containerBounds.left : 50
    const relativeY = containerBounds ? clientY - containerBounds.top : 50

    setLeaves(prev => prev.map(l => l.id === id ? { ...l, popped: true } : l))
    setCaught(c => c + 1)
    
    const popId = Date.now()
    setPopTexts(prev => [...prev, { id: popId, x: relativeX, y: relativeY }])
    
    setTimeout(() => {
      setLeaves(prev => prev.filter(l => l.id !== id))
      if (timeoutsRef.current[id]) {
        clearTimeout(timeoutsRef.current[id])
        delete timeoutsRef.current[id]
      }
    }, 300)

    setTimeout(() => {
      setPopTexts(prev => prev.filter(p => p.id !== popId))
    }, 1000)
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading || !isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#f0f6fc] pt-24 pb-12">
      <style>{`
        @keyframes leafFall {
          0% { transform: translateY(-50px) translateX(0); opacity: 0.9; }
          25% { transform: translateY(25vh) translateX(15px); opacity: 0.9; }
          50% { transform: translateY(50vh) translateX(-15px); opacity: 0.9; }
          75% { transform: translateY(75vh) translateX(15px); opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translateY(110vh) translateX(-15px); opacity: 0; }
        }
        @keyframes leafPop {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes floatText {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
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
            <h1 className="text-[20px] font-medium text-[#1e3a5f] mb-1">Falling Leaves</h1>
            <p className="text-[13px] text-slate-500 mb-4">Gently catch the falling leaves. No rush, no pressure.</p>
            <div className="inline-flex items-center justify-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
              <span className="text-sm font-medium text-[#1e3a5f]">🍃 {caught} caught</span>
            </div>
          </div>

          {/* Game Container */}
          <div 
            id="falling-leaves-game"
            className="relative w-full h-[70vh] min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-default touch-none"
          >
            {leaves.map(leaf => (
              <div
                key={leaf.id}
                onClick={(e) => handleCatch(e, leaf.id)}
                onTouchStart={(e) => handleCatch(e, leaf.id)}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${leaf.x}%`,
                  top: 0,
                  fontSize: `${leaf.size}px`,
                  cursor: 'pointer',
                  padding: '22px', // Minimum 44px effective touch area
                  margin: '-22px',
                  pointerEvents: leaf.popped ? 'none' : 'auto',
                  animation: leaf.popped 
                    ? 'leafPop 0.3s ease-out forwards' 
                    : `leafFall ${leaf.duration}ms linear forwards`,
                  animationPlayState: isPaused && !leaf.popped ? 'paused' : 'running',
                  zIndex: 10
                }}
              >
                {leaf.emoji}
              </div>
            ))}

            {popTexts.map(pop => (
              <div
                key={pop.id}
                className="absolute text-[#16a34a] font-bold text-sm pointer-events-none z-20"
                style={{
                  left: pop.x,
                  top: pop.y,
                  animation: 'floatText 1s ease-out forwards'
                }}
              >
                +1 🍃
              </div>
            ))}
          </div>

          {/* Controls & Stats */}
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Session Time</span>
              <span className="text-lg font-medium text-[#1e3a5f]">{formatTime(seconds)}</span>
            </div>
            
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2563a8] text-white shadow-md hover:bg-[#1e4f86] transition-colors border-none cursor-pointer"
            >
              {isPaused ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
            </button>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Leaves Caught</span>
              <span className="text-lg font-medium text-[#1e3a5f]">{caught}</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
