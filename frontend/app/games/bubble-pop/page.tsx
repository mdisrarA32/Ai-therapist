'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/contexts/session-context'
import { Container } from '@/components/ui/container'
import { ArrowLeft, Pause, Play, Moon, Sun } from 'lucide-react'

interface Bubble {
  id: number
  color: string
  x: number
  size: number
  duration: number
  popped: boolean
}

export default function BubblePopPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useSession()

  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [poppedCount, setPoppedCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const [popTexts, setPopTexts] = useState<{id: number, x: number, y: number}[]>([])
  
  const bubbleIdRef = useRef(0)
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
    
    const spawnBubble = () => {
      setBubbles(prev => {
        const activeBubbles = prev.filter(b => !b.popped)
        if (activeBubbles.length >= 10) return prev

        const colors = [
          'rgba(147, 197, 253, 0.7)',
          'rgba(167, 243, 208, 0.7)',
          'rgba(196, 181, 253, 0.7)',
          'rgba(253, 186, 116, 0.7)',
          'rgba(249, 168, 212, 0.7)'
        ]
        
        const id = bubbleIdRef.current++
        const duration = 5000 + Math.random() * 4000
        
        const newBubble: Bubble = {
          id,
          color: colors[Math.floor(Math.random() * colors.length)],
          x: 5 + Math.random() * 80,
          size: 40 + Math.random() * 40,
          duration,
          popped: false
        }
        
        timeoutsRef.current[id] = setTimeout(() => {
          setBubbles(current => current.filter(b => b.id !== id))
          delete timeoutsRef.current[id]
        }, duration)

        return [...prev, newBubble]
      })
    }

    const timeout = setTimeout(spawnBubble, 1500)
    const interval = setInterval(spawnBubble, 1500)

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

  const handlePop = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    let clientX = 0
    let clientY = 0
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    const containerBounds = document.getElementById('bubble-pop-game')?.getBoundingClientRect()
    const relativeX = containerBounds ? clientX - containerBounds.left : 50
    const relativeY = containerBounds ? clientY - containerBounds.top : 50

    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b))
    setPoppedCount(c => c + 1)
    
    const popId = Date.now()
    setPopTexts(prev => [...prev, { id: popId, x: relativeX, y: relativeY }])
    
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== id))
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
    <div className="min-h-screen pt-24 pb-12 transition-colors duration-500" style={{ backgroundColor: isDark ? '#0f172a' : '#f0f6fc' }}>
      <style>{`
        @keyframes bubbleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          5% { opacity: 1; }
          25% { transform: translateY(-25vh) translateX(20px); opacity: 1; }
          50% { transform: translateY(-50vh) translateX(-20px); opacity: 1; }
          75% { transform: translateY(-75vh) translateX(20px); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-110vh) translateX(-20px); opacity: 0; }
        }
        @keyframes bubblePop {
          0% { transform: scale(1); opacity: 1; }
          50% { box-shadow: inset 0 0 0 4px rgba(255,255,255,0.8); }
          100% { transform: scale(1.5); opacity: 0; border-width: 0px; }
        }
        @keyframes floatText {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
        }
      `}</style>
      
      <Container>
        <div className="max-w-[480px] mx-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center font-medium hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
              style={{ color: isDark ? '#60a5fa' : '#2563a8' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center text-sm font-medium hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
              style={{ color: isDark ? '#cbd5e1' : '#64748b' }}
            >
              {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              Calm mode
            </button>
          </div>

          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-medium mb-1 transition-colors" style={{ color: isDark ? '#f8fafc' : '#1e3a5f' }}>Bubble Pop</h1>
            <p className="text-[13px] mb-4 transition-colors" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Pop the bubbles at your own pace. Just breathe and tap.</p>
            <div className="inline-flex items-center justify-center bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
              <span className="text-sm font-medium text-[#1e3a5f]">🫧 {poppedCount} popped</span>
            </div>
          </div>

          {/* Game Container */}
          <div 
            id="bubble-pop-game"
            className="relative w-full h-[70vh] min-h-[400px] rounded-2xl shadow-sm overflow-hidden cursor-default touch-none transition-colors duration-500"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
            }}
          >
            {bubbles.map(bubble => (
              <div
                key={bubble.id}
                onClick={(e) => handlePop(e, bubble.id)}
                onTouchStart={(e) => handlePop(e, bubble.id)}
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  left: `${bubble.x}%`,
                  bottom: `-80px`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  backgroundColor: bubble.color,
                  border: '2px solid rgba(255,255,255,0.6)',
                  boxShadow: 'inset -6px -6px 12px rgba(255,255,255,0.4), inset 4px 4px 8px rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  pointerEvents: bubble.popped ? 'none' : 'auto',
                  animation: bubble.popped 
                    ? 'bubblePop 0.3s ease-out forwards' 
                    : `bubbleFloat ${bubble.duration}ms linear forwards`,
                  animationPlayState: isPaused && !bubble.popped ? 'paused' : 'running',
                  zIndex: 10
                }}
              />
            ))}

            {popTexts.map(pop => (
              <div
                key={pop.id}
                className="absolute font-bold text-sm pointer-events-none z-20"
                style={{
                  left: pop.x,
                  top: pop.y,
                  color: isDark ? '#38bdf8' : '#0284c7',
                  animation: 'floatText 1s ease-out forwards'
                }}
              >
                +1 🫧
              </div>
            ))}
          </div>

          {/* Controls & Stats */}
          <div 
            className="mt-6 flex items-center justify-between p-4 rounded-xl shadow-sm transition-colors duration-500"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #f1f5f9'
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-semibold transition-colors" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Session Time</span>
              <span className="text-lg font-medium transition-colors" style={{ color: isDark ? '#f8fafc' : '#1e3a5f' }}>{formatTime(seconds)}</span>
            </div>
            
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-md transition-colors border-none cursor-pointer"
              style={{ backgroundColor: isDark ? '#3b82f6' : '#2563a8' }}
            >
              {isPaused ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
            </button>
            
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wider font-semibold transition-colors" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Popped</span>
              <span className="text-lg font-medium transition-colors" style={{ color: isDark ? '#f8fafc' : '#1e3a5f' }}>{poppedCount}</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
