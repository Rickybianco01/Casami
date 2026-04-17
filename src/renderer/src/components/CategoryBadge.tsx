import type { Category } from '@shared/types'
import { getIcon } from '../lib/icons'

interface CategoryBadgeProps {
  category: Category | undefined
  size?: number
  withLabel?: boolean
}

export function CategoryBadge({ category, size = 42, withLabel = true }: CategoryBadgeProps) {
  if (!category) {
    return (
      <div className="flex items-center gap-3">
        <div
          style={{ width: size, height: size }}
          className="rounded-full bg-cream-300 flex items-center justify-center text-ink-500"
        >
          ?
        </div>
        {withLabel && <span className="font-semibold text-ink-500">Senza categoria</span>}
      </div>
    )
  }
  const Icon = getIcon(category.icon)
  return (
    <div className="flex items-center gap-3">
      <div
        style={{ width: size, height: size, backgroundColor: category.color }}
        className="rounded-full flex items-center justify-center text-white shadow-card"
      >
        <Icon size={Math.round(size * 0.52)} />
      </div>
      {withLabel && <span className="font-semibold">{category.name}</span>}
    </div>
  )
}
