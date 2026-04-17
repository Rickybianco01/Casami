import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { CategoryBadge } from '../components/CategoryBadge'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { UndoToast } from '../components/UndoToast'
import { useExpenseStore } from '../stores/expenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import {
  currentMonth,
  monthLabel,
  previousMonth,
  nextMonth,
  prettyDate,
  dayKey
} from '../lib/dates'
import { formatEuro } from '../lib/format'
import { it } from '@shared/i18n'

export function ExpenseList() {
  const [month, setMonth] = useState<string>(currentMonth())
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [undoId, setUndoId] = useState<string | null>(null)
  const { expenses, loadMonth, softDelete, restore } = useExpenseStore()
  const categories = useCategoryStore((s) => s.active)()
  const byId = useCategoryStore((s) => s.byId)

  useEffect(() => {
    loadMonth(month)
  }, [month, loadMonth])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return expenses
      .filter((e) => (catFilter ? e.categoryId === catFilter : true))
      .filter((e) => {
        if (!term) return true
        const cat = byId(e.categoryId)
        return (
          (cat?.name.toLowerCase().includes(term) ?? false) ||
          (e.note ?? '').toLowerCase().includes(term)
        )
      })
      .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
  }, [expenses, search, catFilter, byId])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    filtered.forEach((exp) => {
      const k = dayKey(exp.occurredOn)
      const bucket = map.get(k) ?? []
      bucket.push(exp)
      map.set(k, bucket)
    })
    return Array.from(map.entries())
  }, [filtered])

  async function handleDelete(id: string) {
    await softDelete(id)
    setUndoId(id)
  }

  async function doUndo() {
    if (!undoId) return
    await restore(undoId)
    setUndoId(null)
  }

  return (
    <>
      <TopBar title={it.list.title} />
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="card flex items-center gap-3">
          <button
            onClick={() => setMonth(previousMonth(month))}
            className="p-2 rounded-lg hover:bg-cream-200"
            aria-label="Mese precedente"
          >
            <ChevronLeft size={24} />
          </button>
          <p className="flex-1 text-center text-xl font-heading font-bold capitalize">
            {monthLabel(month)}
          </p>
          <button
            onClick={() => setMonth(nextMonth(month))}
            className="p-2 rounded-lg hover:bg-cream-200"
            aria-label="Mese successivo"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="card space-y-3">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              className="input pl-10"
              placeholder={it.list.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
                onClick={() => setSearch('')}
                aria-label="Pulisci ricerca"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className={`chip ${catFilter === null ? 'chip-active' : ''}`}
              onClick={() => setCatFilter(null)}
            >
              {it.list.allCategories}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`chip ${catFilter === c.id ? 'chip-active' : ''}`}
                onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={it.list.empty}
            action={
              <Link to="/aggiungi">
                <Button size="lg">
                  <Plus size={20} /> {it.list.emptyCta}
                </Button>
              </Link>
            }
          />
        ) : (
          grouped.map(([day, items]) => {
            const dayTotal = items.reduce((acc, x) => acc + x.amountCents, 0)
            return (
              <div key={day} className="card">
                <div className="flex items-center justify-between pb-2 border-b border-cream-300">
                  <p className="font-heading font-bold text-lg capitalize">{prettyDate(day)}</p>
                  <p className="text-ink-500">
                    {it.list.dailyTotal}: <span className="font-bold text-ink-900">{formatEuro(dayTotal)}</span>
                  </p>
                </div>
                <ul className="divide-y divide-cream-300">
                  {items.map((exp) => {
                    const cat = byId(exp.categoryId)
                    return (
                      <li key={exp.id} className="flex items-center gap-3 py-3">
                        <Link
                          to={`/spese/${exp.id}`}
                          className="flex items-center gap-3 flex-1"
                        >
                          <CategoryBadge category={cat} withLabel={false} size={40} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{cat?.name ?? 'Senza categoria'}</p>
                            {exp.note && (
                              <p className="text-ink-500 text-sm truncate">{exp.note}</p>
                            )}
                          </div>
                          <p className="font-bold text-lg whitespace-nowrap">
                            {formatEuro(exp.amountCents)}
                          </p>
                        </Link>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="text-ink-500 hover:text-danger-600 p-2"
                          aria-label="Cancella"
                        >
                          <X size={20} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })
        )}
      </div>
      {undoId && (
        <UndoToast
          message={it.list.deleted}
          onUndo={doUndo}
          onDismiss={() => setUndoId(null)}
        />
      )}
    </>
  )
}
