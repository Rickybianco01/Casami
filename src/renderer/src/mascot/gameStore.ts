import { create } from 'zustand'
import { ipc } from '../lib/ipc'

interface GameState {
  activeBiscottoId: string | null
  cucciolate: number
  lastCaughtAt: number | null
  acquireLock: (id: string) => boolean
  releaseLock: (id: string) => void
  incrementCucciolate: () => Promise<void>
  syncFromSettings: (cucciolate: number) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  activeBiscottoId: null,
  cucciolate: 0,
  lastCaughtAt: null,
  acquireLock: (id) => {
    const current = get().activeBiscottoId
    if (current && current !== id) return false
    set({ activeBiscottoId: id })
    return true
  },
  releaseLock: (id) => {
    if (get().activeBiscottoId === id) set({ activeBiscottoId: null })
  },
  incrementCucciolate: async () => {
    const next = get().cucciolate + 1
    set({ cucciolate: next, lastCaughtAt: Date.now() })
    try {
      await ipc.settings.update({ cucciolate: next })
    } catch {
      /* best effort, local counter already updated */
    }
  },
  syncFromSettings: (cucciolate) => {
    set({ cucciolate: Number.isFinite(cucciolate) ? cucciolate : 0 })
  }
}))
