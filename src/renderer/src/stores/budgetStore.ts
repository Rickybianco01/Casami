import { create } from 'zustand'
import type { Budget, ID } from '@shared/types'
import { ipc } from '../lib/ipc'

interface BudgetState {
  budgets: Budget[]
  reload: () => Promise<void>
  upsert: (input: Omit<Budget, 'id'> & { id?: ID }) => Promise<Budget>
  remove: (id: ID) => Promise<void>
  forCategory: (categoryId: ID, month: string | null) => Budget | undefined
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  reload: async () => {
    const budgets = await ipc.budgets.list()
    set({ budgets })
  },
  upsert: async (input) => {
    const b = await ipc.budgets.upsert(input)
    await get().reload()
    return b
  },
  remove: async (id) => {
    await ipc.budgets.remove(id)
    set({ budgets: get().budgets.filter((b) => b.id !== id) })
  },
  forCategory: (categoryId, month) =>
    get().budgets.find(
      (b) => b.categoryId === categoryId && (b.month === month || (b.month === null && !month))
    )
}))
