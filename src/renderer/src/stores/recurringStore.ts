import { create } from 'zustand'
import type { RecurringExpense, ID } from '@shared/types'
import { ipc } from '../lib/ipc'

interface RecurringState {
  items: RecurringExpense[]
  reload: () => Promise<void>
  create: (input: Omit<RecurringExpense, 'id' | 'createdAt'>) => Promise<RecurringExpense>
  update: (
    id: ID,
    patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>
  ) => Promise<RecurringExpense>
  remove: (id: ID) => Promise<void>
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  items: [],
  reload: async () => {
    const items = await ipc.recurring.list()
    set({ items })
  },
  create: async (input) => {
    const item = await ipc.recurring.create(input)
    set({ items: [...get().items, item] })
    return item
  },
  update: async (id, patch) => {
    const item = await ipc.recurring.update(id, patch)
    set({ items: get().items.map((r) => (r.id === id ? item : r)) })
    return item
  },
  remove: async (id) => {
    await ipc.recurring.remove(id)
    set({ items: get().items.filter((r) => r.id !== id) })
  }
}))
