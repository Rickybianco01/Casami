import type { ReactNode } from 'react'
import { Biscotto } from '../mascot/Biscotto'

interface EmptyStateProps {
  title: string
  body?: string
  mood?: 'happy' | 'sleepy' | 'cheer' | 'thinking'
  action?: ReactNode
}

export function EmptyState({ title, body, mood = 'happy', action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-10">
      <Biscotto size={120} mood={mood} wag={mood !== 'sleepy'} />
      <h3 className="font-heading text-xl text-ink-700">{title}</h3>
      {body && <p className="text-ink-500 max-w-md">{body}</p>}
      {action}
    </div>
  )
}
