import { create } from 'zustand'
import { ipc } from '../lib/ipc'
import { useCategoryStore } from './categoryStore'
import { useSettingsStore } from './settingsStore'
import { useExpenseStore } from './expenseStore'
import { useGameStore } from '../mascot/gameStore'
import { currentMonth } from '../lib/dates'

interface BootstrapState {
  ready: boolean
  error: string | null
  load: () => Promise<void>
}

export const useBootstrap = create<BootstrapState>((set) => ({
  ready: false,
  error: null,
  load: async () => {
    try {
      const [settings, categories] = await Promise.all([
        ipc.settings.get(),
        ipc.categories.list()
      ])
      useSettingsStore.setState({ settings })
      useCategoryStore.setState({ categories })
      useGameStore.getState().syncFromSettings(settings.cucciolate ?? 0)
      await useExpenseStore.getState().loadMonth(currentMonth())
      try {
        await ipc.backup.autoIfDue()
      } catch {
        /* best effort */
      }
      set({ ready: true, error: null })
    } catch (err) {
      set({ ready: false, error: err instanceof Error ? err.message : 'Errore sconosciuto' })
    }
  }
}))
