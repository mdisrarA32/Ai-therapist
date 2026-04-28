export type MoodTier = 'too-low' | 'low' | 'neutral' | 'happy' | 'excited'

export interface Suggestion {
  id: string
  type: 'activity' | 'game' | 'affirmation' | 'tip'
  title: string
  description: string
  duration?: string
  actionLabel: string
  actionTarget?: string
}

export const activitiesByMood: Record<MoodTier, Suggestion[]> = {
  'too-low': [
    { id: 'tl-1', type: 'activity', title: 'Box Breathing', description: 'A calming 4-4-4-4 breath pattern to slow your nervous system down.', duration: '3 mins', actionLabel: 'Open activity', actionTarget: 'modal:breathing' },
    { id: 'tl-2', type: 'activity', title: 'Grounding Exercise', description: 'The 5-4-3-2-1 technique. Name what you see, hear, and feel right now.', duration: '4 mins', actionLabel: 'Open activity', actionTarget: 'modal:breathing' },
    { id: 'tl-3', type: 'activity', title: 'Ocean Waves', description: 'Match your breath with gentle ocean waves. Very calming.', duration: '5 mins', actionLabel: 'Open activity', actionTarget: 'modal:ocean-waves' },
    { id: 'tl-4', type: 'activity', title: 'Crisis Support', description: 'When things feel too heavy — reach out. You are not alone.', actionLabel: 'Get support', actionTarget: 'modal:support' },
    { id: 'tl-g1', type: 'game', title: 'Falling Leaves', description: 'Tap falling leaves gently as they drift down. Slow, calming, zero pressure.', duration: '90 secs', actionLabel: 'Play', actionTarget: '/games/falling-leaves' },
  ],
  'low': [
    { id: 'l-1', type: 'activity', title: 'Mindful Forest Walk', description: 'A peaceful virtual walk through a quiet forest. Let your mind rest.', duration: '15 mins', actionLabel: 'Open activity', actionTarget: 'modal:mindful-forest' },
    { id: 'l-2', type: 'activity', title: 'Ocean Waves', description: 'Breathe with the ocean. Gentle and slow.', duration: '8 mins', actionLabel: 'Open activity', actionTarget: 'modal:ocean-waves' },
    { id: 'l-3', type: 'activity', title: 'Breathing Patterns', description: 'Follow a calming breathing pattern with visual guidance.', duration: '5 mins', actionLabel: 'Open activity', actionTarget: 'modal:breathing' },
    { id: 'l-g1', type: 'game', title: 'Bubble Pop', description: 'Slowly pop floating bubbles. One tap each. Quiet and satisfying.', duration: '2 mins', actionLabel: 'Play', actionTarget: '/games/bubble-pop' },
  ],
  'neutral': [
    { id: 'n-1', type: 'activity', title: 'Zen Garden', description: 'Create and arrange your own digital peaceful space. No wrong answers.', duration: '10 mins', actionLabel: 'Open activity', actionTarget: 'modal:zen-garden' },
    { id: 'n-2', type: 'activity', title: 'Breathing Patterns', description: 'Maintain your calm with a short breathing session.', duration: '5 mins', actionLabel: 'Open activity', actionTarget: 'modal:breathing' },
    { id: 'n-3', type: 'activity', title: 'Mindful Forest', description: 'Take a quiet walk through the virtual forest. Clear your head.', duration: '15 mins', actionLabel: 'Open activity', actionTarget: 'modal:mindful-forest' },
    { id: 'n-g1', type: 'game', title: 'Memory Tiles', description: 'Flip and match calming nature image tiles. Gentle focus exercise.', duration: '3 mins', actionLabel: 'Play', actionTarget: '/games/memory-tiles' },
  ],
  'happy': [
    { id: 'h-1', type: 'activity', title: 'Zen Garden', description: 'You are in a great state to create something beautiful.', duration: '10 mins', actionLabel: 'Open activity', actionTarget: 'modal:zen-garden' },
    { id: 'h-2', type: 'activity', title: 'Ocean Waves', description: 'Ride the wave of your good mood with ocean breathing.', duration: '8 mins', actionLabel: 'Open activity', actionTarget: 'modal:ocean-waves' },
    { id: 'h-g1', type: 'game', title: 'Color Matching', description: 'Match vibrant color patterns. Energetic and satisfying.', duration: '2 mins', actionLabel: 'Play', actionTarget: '/games/color-match' },
  ],
  'excited': [
    { id: 'e-1', type: 'activity', title: 'Zen Garden', description: 'Channel this energy into something creative and beautiful.', duration: '10 mins', actionLabel: 'Open activity', actionTarget: 'modal:zen-garden' },
    { id: 'e-g1', type: 'game', title: 'Reaction Challenge', description: 'Test your reflexes — tap targets as they appear. Fast and energizing.', duration: '90 secs', actionLabel: 'Play', actionTarget: '/games/reaction' },
    { id: 'e-g2', type: 'game', title: 'Word Flow', description: 'Type positive words as fast as they appear. Channel excited energy.', duration: '2 mins', actionLabel: 'Play', actionTarget: '/games/word-flow' },
  ],
}

export const affirmationsByMood: Record<MoodTier, string[]> = {
  'too-low': [
    "It is okay to not be okay. Rest is part of healing.",
    "You have survived every hard day so far. This one too.",
    "Small steps still count. Even breathing deeply is progress.",
    "You do not have to feel better right now. Just be here.",
  ],
  'low': [
    "You showed up today. That already takes strength.",
    "Low days are part of the rhythm, not the whole story.",
    "One small kind act for yourself is enough for today.",
    "You are not falling behind. You are moving at your own pace.",
  ],
  'neutral': [
    "Steady is strong. Not every day needs to be a peak.",
    "You are building something — even on quiet days.",
    "Consistency in small things creates big change over time.",
    "Being present today is the whole job. You are doing it.",
  ],
  'happy': [
    "This feeling is yours. Take a moment to really feel it.",
    "You created this good day. Remember that.",
    "Happiness shared is happiness doubled.",
    "You are exactly where you need to be right now.",
  ],
  'excited': [
    "This energy is a gift. Direct it somewhere meaningful.",
    "Big things are built on days exactly like this one.",
    "Your excitement means you care deeply. That is powerful.",
    "Go after something today. The timing is right.",
  ],
}

export const tipsByMood: Record<MoodTier, string[]> = {
  'too-low': [
    "CBT tip: When thoughts spiral, name the thought — 'I notice I am thinking that...' This creates distance from it.",
    "DBT tip: Cold water on your face resets the nervous system fast. Try it right now.",
    "Therapist note: On very low days, the goal is not to feel better. The goal is to get through safely.",
    "Research: Even 5 minutes of slow breathing activates the parasympathetic nervous system.",
  ],
  'low': [
    "CBT tip: Low mood narrows attention. Deliberately notice 3 neutral things around you to widen your focus.",
    "Behavioral activation: Do one small activity even if you do not feel like it. Action comes before motivation.",
    "Therapist note: Journaling for 5 minutes about feelings (not solutions) reduces emotional weight.",
    "Research: Physical movement for 10 minutes increases mood-regulating neurotransmitters significantly.",
  ],
  'neutral': [
    "Therapist note: Neutral days are ideal for building habits — you have enough energy without being over-stimulated.",
    "CBT tip: Check your thoughts for cognitive distortions today while you have mental clarity.",
    "Mindfulness: 10 minutes of present-moment awareness daily has measurable effects on stress after 2 weeks.",
    "Therapist note: Showing up on neutral days is what builds real mental fitness.",
  ],
  'happy': [
    "Positive psychology: Savoring — spending time appreciating a good feeling — makes happiness last longer.",
    "Therapist note: When you feel good, write a letter to yourself to read on a hard day.",
    "Research: Doing something kind for someone else when happy amplifies your own wellbeing.",
    "CBT tip: Identify what contributed to today's good mood. Understanding your positive triggers is valuable.",
  ],
  'excited': [
    "Therapist note: Excited energy is powerful but can lead to impulsive decisions. Channel it into a planned goal.",
    "Research: Writing down your excited ideas immediately helps the brain process more clearly.",
    "Positive psychology: This is ideal for tackling something you have been avoiding.",
    "CBT tip: Notice what triggered this excited state. Recreating those conditions intentionally is a valid mood regulation strategy.",
  ],
}
