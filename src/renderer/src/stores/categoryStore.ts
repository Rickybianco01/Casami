import { create } from 'zustand'
import type { Category, ID } from '@shared/types'
import { ipc } from '../lib/ipc'

interface CategoryState {
  categories: Category[]
  reload: () => Promise<void>
  create: (input: Omit<Category, 'id'>) => Promise<Category>
  update: (id: ID, patch: Partial<Omit<Category, 'id'>>) => Promise<Category>
  archive: (id: ID, archived: boolean) => Promise<Category>
  byId: (id: ID | null | undefined) => Category | undefined
  active: () => Category[]
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  reload: async () => {
    const categories = await ipc.categories.list()
    set({ categories })
  },
  create: async (input) => {
    const cat = await ipc.categories.create(input)
    set({ categories: [...get().categories, cat] })
    return cat
  },
  update: async (id, patch) => {
    const cat = await ipc.categories.update(id, patch)
    set({ categories: get().categories.map((c) => (c.id === id ? cat : c)) })
    return cat
  },
  archive: async (id, archived) => {
    const cat = await ipc.categories.archive(id, archived)
    set({ categories: get().categories.map((c) => (c.id === id ? cat : c)) })
    return cat
  },
  byId: (id) => (id ? get().categories.find((c) => c.id === id) : undefined),
  active: () =>
    get()
      .categories.filter((c) => !c.archived)
      .sort((a, b) => a.sortOrder - b.sortOrder)
}))
