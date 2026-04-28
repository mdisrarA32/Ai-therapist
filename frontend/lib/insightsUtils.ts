import { activitiesByMood, affirmationsByMood, tipsByMood, MoodTier, Suggestion } from './insightsData'

function pickRandom<T>(pool: T[], avoidItem?: T): T {
  const filtered = avoidItem ? pool.filter(item => item !== avoidItem) : pool
  const source = filtered.length > 0 ? filtered : pool
  return source[Math.floor(Math.random() * source.length)]
}

function pickRandomSuggestion(pool: Suggestion[], avoidId?: string): Suggestion {
  const filtered = avoidId ? pool.filter(s => s.id !== avoidId) : pool
  const source = filtered.length > 0 ? filtered : pool
  return source[Math.floor(Math.random() * source.length)]
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMoodTierFromScore(score: number): MoodTier {
  if (score <= 20) return 'too-low'
  if (score <= 40) return 'low'
  if (score <= 60) return 'neutral'
  if (score <= 80) return 'happy'
  return 'excited'
}

export function getInsights(moodTier: MoodTier): {
  suggestion: Suggestion
  secondItem: { type: 'affirmation' | 'tip'; text: string }
} {
  const pool = activitiesByMood[moodTier]
  let lastId: string | undefined
  try { lastId = sessionStorage.getItem('last_insight_id') ?? undefined } catch {}
  const suggestion = pickRandomSuggestion(pool, lastId)
  try { sessionStorage.setItem('last_insight_id', suggestion.id) } catch {}

  const todayKey = getTodayKey()
  const dayNumber = todayKey.split('-').reduce((sum, part) => sum + parseInt(part), 0)
  const showTip = dayNumber % 2 === 0

  const textPool = showTip ? tipsByMood[moodTier] : affirmationsByMood[moodTier]
  let lastText: string | undefined
  try { lastText = sessionStorage.getItem(`last_text_${moodTier}`) ?? undefined } catch {}
  const text = pickRandom(textPool, lastText)
  try { sessionStorage.setItem(`last_text_${moodTier}`, text) } catch {}

  return {
    suggestion,
    secondItem: { type: showTip ? 'tip' : 'affirmation', text }
  }
}
