import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, Trash2 } from 'lucide-react'
import type { Expense } from '@shared/types'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { CategoryBadge } from '../components/CategoryBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { UndoToast } from '../components/UndoToast'
import { Biscotto } from '../mascot/Biscotto'
import { useExpenseStore } from '../stores/expenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { formatEuro } from '../lib/format'
import { longDate } from '../lib/dates'
import { it } from '@shared/i18n'

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [exp, setExp] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletedId, setDeletedId] = useState<string | null>(null)
  const { get, softDelete, restore } = useExpenseStore()
  const byId = useCategoryStore((s) => s.byId)

  useEffect(() => {
    if (!id) return
    get(id).then((x) => {
      setExp(x)
      setLoading(false)
    })
  }, [id, get])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Biscotto mood="thinking" size={120} />
      </div>
    )
  }

  if (!exp) {
    return (
      <>
        <TopBar title={it.detail.title} back />
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <p className="text-ink-500 text-lg">Spesa non trovata.</p>
        </div>
      </>
    )
  }

  const cat = byId(exp.categoryId)

  async function onConfirmDelete() {
    if (!exp) return
    await softDelete(exp.id)
    setConfirmOpen(false)
    setDeletedId(exp.id)
  }

  async function onUndo() {
    if (!deletedId) return
    await restore(deletedId)
    setDeletedId(null)
  }

  return (
    <>
      <TopBar title={it.detail.title} back />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="card text-center space-y-3">
          <p className="text-5xl font-bold text-terra-700">{formatEuro(exp.amountCents)}</p>
          <div className="flex justify-center">
            <CategoryBadge category={cat} size={56} />
          </div>
          <p className="text-ink-500 text-lg capitalize">{longDate(exp.occurredOn)}</p>
          {exp.note && <p className="italic text-ink-900">&ldquo;{exp.note}&rdquo;</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" block onClick={() => nav(`/aggiungi/${exp.id}`)}>
            <Edit2 size={20} /> {it.detail.edit}
          </Button>
          <Button variant="danger" size="lg" block onClick={() => setConfirmOpen(true)}>
            <Trash2 size={20} /> {it.detail.delete}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={it.detail.confirmDelete}
        body={it.detail.confirmDeleteBody}
        confirmLabel={it.detail.confirm}
        cancelLabel={it.detail.cancel}
        danger
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {deletedId && (
        <UndoToast
          message={it.list.deleted}
          onUndo={onUndo}
          onDismiss={() => {
            setDeletedId(null)
            nav(-1)
          }}
        />
      )}
    </>
  )
}
