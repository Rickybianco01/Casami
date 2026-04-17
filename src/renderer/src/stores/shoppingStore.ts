import { create } from 'zustand'
import type { ShoppingItem, ID } from '@shared/types'
import { ipc } from '../lib/ipc'

interface ShoppingState {
  items: ShoppingItem[]
  reload: () => Promise<void>
  add: (text: string) => Promise<ShoppingItem>
  toggle: (id: ID) => Promise<ShoppingItem>
  remove: (id: ID) => Promise<void>
  clearDone: () => Promise<number>
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  reload: async () => {
    const items = await ipc.shopping.list()
    set({ items })
  },
  add: async (text) => {
    const item = await ipc.shopping.add(text)
    set({ items: [item, ...get().items] })
    return item
  },
  toggle: async (id) => {
    const item = await ipc.shopping.toggle(id)
    set({ items: get().items.map((i) => (i.id === id ? item : i)) })
    return item
  },
  remove: async (id) => {
    await ipc.shopping.remove(id)
    set({ items: get().items.filter((i) => i.id !== id) })
  },
  clearDone: async () => {
    const removed = await ipc.shopping.clearDone()
    await get().reload()
    return removed
  }
}))
