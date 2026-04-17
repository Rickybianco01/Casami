import { useEffect, useState } from 'react'
import { Undo2 } from 'lucide-react'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  durationMs?: number
}

export function UndoToast({ message, onUndo, onDismiss, durationMs = 8000 }: UndoToastProps) {
  const [left, setLeft] = useState(durationMs)
  useEffect(() => {
    const start = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = durationMs - elapsed
      if (remaining <= 0) {
        window.clearInterval(interval)
        onDismiss()
        setLeft(0)
      } else {
        setLeft(remaining)
      }
    }, 100)
    return () => window.clearInterval(interval)
  }, [durationMs, onDismiss])
  const pct = Math.max(0, Math.min(100, (left / durationMs) * 100))
  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-ink-700 text-cream-50 rounded-xl shadow-pop px-5 py-3 flex items-center gap-4 min-w-[320px] animate-slideUp"
    >
      <span className="flex-1 font-semibold">{message}</span>
      <button
        onClick={onUndo}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream-50 text-ink-700 font-semibold hover:bg-cream-200"
      >
        <Undo2 size={18} /> Annulla
      </button>
      <div className="absolute left-3 right-3 bottom-1 h-1 bg-ink-500/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-terracotta-300 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
