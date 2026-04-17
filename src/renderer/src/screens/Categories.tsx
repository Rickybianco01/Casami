import { useEffect, useState } from 'react'
import { Archive, Edit2, Plus, RotateCcw } from 'lucide-react'
import type { Category } from '@shared/types'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CategoryBadge } from '../components/CategoryBadge'
import { useCategoryStore } from '../stores/categoryStore'
import { ICON_NAMES, getIcon } from '../lib/icons'
import { it } from '@shared/i18n'

const COLOR_SWATCHES = [
  '#C86A3C',
  '#DB9468',
  '#E9B895',
  '#6B8E23',
  '#B3C179',
  '#B23A3A',
  '#8F4A28',
  '#B05730',
  '#8B7D76',
  '#3A4A2E'
]

interface EditState {
  id: string | null
  name: string
  color: string
  icon: string
}

const emptyEdit: EditState = { id: null, name: '', color: COLOR_SWATCHES[0], icon: 'tag' }

export function Categories() {
  const { categories, reload, create, update, archive } = useCategoryStore()
  const [modal, setModal] = useState<EditState | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    reload()
  }, [reload])

  const active = categories
    .filter((c) => !c.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const archived = categories.filter((c) => c.archived)

  function openNew() {
    setModal({ ...emptyEdit })
  }

  function openEdit(c: Category) {
    setModal({ id: c.id, name: c.name, color: c.color, icon: c.icon })
  }

  async function save() {
    if (!modal) return
    const trimmed = modal.name.trim()
    if (!trimmed) return
    if (modal.id) {
      await update(modal.id, { name: trimmed, color: modal.color, icon: modal.icon })
    } else {
      const maxSort = Math.max(0, ...categories.map((c) => c.sortOrder))
      await create({
        slug: `custom-${Date.now()}`,
        name: trimmed,
        color: modal.color,
        icon: modal.icon,
        isDefault: false,
        sortOrder: maxSort + 10,
        archived: false
      })
    }
    setModal(null)
  }

  return (
    <>
      <TopBar
        title={it.categories.title}
        back
        right={
          <Button onClick={openNew} size="md">
            <Plus size={18} /> {it.categories.add}
          </Button>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <ul className="card divide-y divide-cream-300">
          {active.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <CategoryBadge category={c} withLabel={false} size={40} />
              <span className="flex-1 font-semibold">{c.name}</span>
              <button
                onClick={() => openEdit(c)}
                className="p-2 rounded-lg hover:bg-cream-200 text-ink-500"
                aria-label={it.categories.edit}
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => archive(c.id, true)}
                className="p-2 rounded-lg hover:bg-cream-200 text-ink-500"
                aria-label={it.categories.archive}
              >
                <Archive size={18} />
              </button>
            </li>
          ))}
        </ul>

        {archived.length > 0 && (
          <>
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="text-terra-700 font-semibold hover:underline"
            >
              {showArchived ? 'Nascondi' : 'Mostra'} {it.categories.archived.toLowerCase()} (
              {archived.length})
            </button>
            {showArchived && (
              <ul className="card divide-y divide-cream-300">
                {archived.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-3 opacity-70">
                    <CategoryBadge category={c} withLabel={false} size={40} />
                    <span className="flex-1 font-semibold">{c.name}</span>
                    <button
                      onClick={() => archive(c.id, false)}
                      className="p-2 rounded-lg hover:bg-cream-200 text-olive-600"
                      aria-label={it.categories.restore}
                    >
                      <RotateCcw size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.id ? it.categories.edit : it.categories.add}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {it.common.cancel}
            </Button>
            <Button onClick={save}>{it.common.save}</Button>
          </>
        }
      >
        {modal && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="cat-name">
                {it.categories.name}
              </label>
              <input
                id="cat-name"
                className="input"
                value={modal.name}
                onChange={(e) => setModal({ ...modal, name: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <p className="label">{it.categories.color}</p>
              <div className="flex gap-2 flex-wrap">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setModal({ ...modal, color: c })}
                    className={`w-10 h-10 rounded-full border-4 ${
                      modal.color === c ? 'border-ink-900' : 'border-white'
                    } shadow-card`}
                    style={{ backgroundColor: c }}
                    aria-label={`Colore ${c}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="label">{it.categories.icon}</p>
              <div className="grid grid-cols-6 gap-2">
                {ICON_NAMES.map((iconName) => {
                  const Icon = getIcon(iconName)
                  const selected = modal.icon === iconName
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setModal({ ...modal, icon: iconName })}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center ${
                        selected ? 'border-terra-500 bg-cream-200' : 'border-transparent bg-cream-100'
                      }`}
                    >
                      <Icon size={24} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
