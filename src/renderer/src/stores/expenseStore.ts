import { create } from 'zustand'
import type { Expense, ID, MonthlySummary } from '@shared/types'
import { ipc } from '../lib/ipc'

interface ExpenseInput {
  amountCents: number
  categoryId: ID
  occurredOn: string
  note?: string | null
}

interface ExpenseState {
  month: string | null
  expenses: Expense[]
  summary: MonthlySummary | null
  loading: boolean
  loadMonth: (month: string) => Promise<void>
  reloadCurrent: () => Promise<void>
  create: (input: ExpenseInput) => Promise<Expense>
  update: (id: ID, patch: Partial<ExpenseInput>) => Promise<Expense>
  softDelete: (id: ID) => Promise<Expense>
  restore: (id: ID) => Promise<Expense>
  get: (id: ID) => Promise<Expense | null>
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  month: null,
  expenses: [],
  summary: null,
  loading: false,
  loadMonth: async (month) => {
    set({ loading: true, month })
    try {
      const [expenses, summary] = await Promise.all([
        ipc.expenses.listByMonth(month),
        ipc.expenses.summary(month)
      ])
      set({ expenses, summary, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },
  reloadCurrent: async () => {
    const m = get().month
    if (!m) return
    await get().loadMonth(m)
  },
  create: async (input) => {
    const exp = await ipc.expenses.create({
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      occurredOn: input.occurredOn,
      note: input.note ?? null
    })
    await get().reloadCurrent()
    return exp
  },
  update: async (id, patch) => {
    const exp = await ipc.expenses.update(id, patch)
    await get().reloadCurrent()
    return exp
  },
  softDelete: async (id) => {
    const exp = await ipc.expenses.softDelete(id)
    await get().reloadCurrent()
    return exp
  },
  restore: async (id) => {
    const exp = await ipc.expenses.restore(id)
    await get().reloadCurrent()
    return exp
  },
  get: async (id) => ipc.expenses.get(id)
}))
