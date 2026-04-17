import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widthClass = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-700/40 animate-[slideUp_0.2s_ease-out]">
      <div className={`w-full ${widthClass[size]} bg-cream-50 rounded-xl shadow-pop overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300">
          <h2 className="font-heading font-semibold text-xl">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="p-2 rounded-lg hover:bg-cream-200 text-ink-500"
          >
            <X size={22} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto scroll-y">{children}</div>
        {footer && <div className="px-6 py-4 bg-cream-100 border-t border-cream-300 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
