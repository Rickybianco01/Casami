import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface TopBarProps {
  title: string
  back?: boolean
  right?: ReactNode
  subtitle?: string
}

export function TopBar({ title, back, right, subtitle }: TopBarProps) {
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur border-b border-cream-300">
      <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-3">
        {back && (
          <button
            onClick={() => nav(-1)}
            className="p-2 rounded-lg hover:bg-cream-200 text-ink-500"
            aria-label="Indietro"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">{title}</h1>
          {subtitle && <p className="text-ink-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
