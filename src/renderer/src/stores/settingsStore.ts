import { create } from 'zustand'
import type { Settings } from '@shared/types'
import { ipc } from '../lib/ipc'

interface SettingsState {
  settings: Settings | null
  update: (patch: Partial<Settings>) => Promise<Settings>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  update: async (patch) => {
    const next = await ipc.settings.update(patch)
    set({ settings: next })
    return next
  }
}))
