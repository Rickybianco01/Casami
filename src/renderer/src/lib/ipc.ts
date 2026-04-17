import type {
  Category,
  Expense,
  Budget,
  RecurringExpense,
  ShoppingItem,
  Settings,
  MonthlySummary,
  IpcResult,
  UpdateStatus,
  ID
} from '@shared/types'

type CasamiBridge = {
  categories: {
    list: () => Promise<IpcResult<Category[]>>
    create: (input: Omit<Category, 'id'>) => Promise<IpcResult<Category>>
    update: (id: ID, patch: Partial<Omit<Category, 'id'>>) => Promise<IpcResult<Category>>
    archive: (id: ID, archived: boolean) => Promise<IpcResult<Category>>
  }
  expenses: {
    listByMonth: (month: string) => Promise<IpcResult<Expense[]>>
    listAll: () => Promise<IpcResult<Expense[]>>
    get: (id: ID) => Promise<IpcResult<Expense | null>>
    create: (input: {
      amountCents: number
      categoryId: ID
      occurredOn: string
      note?: string | null
      recurringExpenseId?: ID | null
    }) => Promise<IpcResult<Expense>>
    update: (
      id: ID,
      patch: Partial<Pick<Expense, 'amountCents' | 'categoryId' | 'occurredOn' | 'note'>>
    ) => Promise<IpcResult<Expense>>
    softDelete: (id: ID) => Promise<IpcResult<Expense>>
    restore: (id: ID) => Promise<IpcResult<Expense>>
    summary: (month: string) => Promise<IpcResult<MonthlySummary>>
  }
  budgets: {
    list: () => Promise<IpcResult<Budget[]>>
    upsert: (input: Omit<Budget, 'id'> & { id?: ID }) => Promise<IpcResult<Budget>>
    remove: (id: ID) => Promise<IpcResult<boolean>>
  }
  recurring: {
    list: () => Promise<IpcResult<RecurringExpense[]>>
    create: (input: Omit<RecurringExpense, 'id' | 'createdAt'>) => Promise<IpcResult<RecurringExpense>>
    update: (
      id: ID,
      patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>
    ) => Promise<IpcResult<RecurringExpense>>
    remove: (id: ID) => Promise<IpcResult<boolean>>
  }
  shopping: {
    list: () => Promise<IpcResult<ShoppingItem[]>>
    add: (text: string) => Promise<IpcResult<ShoppingItem>>
    toggle: (id: ID) => Promise<IpcResult<ShoppingItem>>
    remove: (id: ID) => Promise<IpcResult<boolean>>
    clearDone: () => Promise<IpcResult<number>>
  }
  settings: {
    get: () => Promise<IpcResult<Settings>>
    update: (patch: Partial<Settings>) => Promise<IpcResult<Settings>>
  }
  backup: {
    pickFolder: () => Promise<IpcResult<string | null>>
    exportNow: (folder?: string) => Promise<IpcResult<string | null>>
    importNow: () => Promise<IpcResult<string | null>>
    autoIfDue: () => Promise<IpcResult<{ ran: boolean; path?: string; reason?: string }>>
  }
  app: {
    version: () => Promise<IpcResult<string>>
    openExternal: (url: string) => Promise<IpcResult<void>>
    savePdf: (fileName: string) => Promise<IpcResult<string | null>>
  }
  updater: {
    check: () => Promise<IpcResult<string | null>>
    download: () => Promise<IpcResult<boolean>>
    install: () => Promise<IpcResult<boolean>>
    status: () => Promise<IpcResult<UpdateStatus>>
    onStatus: (listener: (status: UpdateStatus) => void) => () => void
  }
}

declare global {
  interface Window {
    casami: CasamiBridge
  }
}

async function unwrap<T>(p: Promise<IpcResult<T>>): Promise<T> {
  const res = await p
  if (!res.ok) throw new Error(res.error)
  return res.value
}

export const ipc = {
  categories: {
    list: () => unwrap(window.casami.categories.list()),
    create: (input: Omit<Category, 'id'>) => unwrap(window.casami.categories.create(input)),
    update: (id: ID, patch: Partial<Omit<Category, 'id'>>) =>
      unwrap(window.casami.categories.update(id, patch)),
    archive: (id: ID, archived: boolean) => unwrap(window.casami.categories.archive(id, archived))
  },
  expenses: {
    listByMonth: (month: string) => unwrap(window.casami.expenses.listByMonth(month)),
    listAll: () => unwrap(window.casami.expenses.listAll()),
    get: (id: ID) => unwrap(window.casami.expenses.get(id)),
    create: (input: {
      amountCents: number
      categoryId: ID
      occurredOn: string
      note?: string | null
      recurringExpenseId?: ID | null
    }) => unwrap(window.casami.expenses.create(input)),
    update: (
      id: ID,
      patch: Partial<Pick<Expense, 'amountCents' | 'categoryId' | 'occurredOn' | 'note'>>
    ) => unwrap(window.casami.expenses.update(id, patch)),
    softDelete: (id: ID) => unwrap(window.casami.expenses.softDelete(id)),
    restore: (id: ID) => unwrap(window.casami.expenses.restore(id)),
    summary: (month: string) => unwrap(window.casami.expenses.summary(month))
  },
  budgets: {
    list: () => unwrap(window.casami.budgets.list()),
    upsert: (input: Omit<Budget, 'id'> & { id?: ID }) =>
      unwrap(window.casami.budgets.upsert(input)),
    remove: (id: ID) => unwrap(window.casami.budgets.remove(id))
  },
  recurring: {
    list: () => unwrap(window.casami.recurring.list()),
    create: (input: Omit<RecurringExpense, 'id' | 'createdAt'>) =>
      unwrap(window.casami.recurring.create(input)),
    update: (id: ID, patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) =>
      unwrap(window.casami.recurring.update(id, patch)),
    remove: (id: ID) => unwrap(window.casami.recurring.remove(id))
  },
  shopping: {
    list: () => unwrap(window.casami.shopping.list()),
    add: (text: string) => unwrap(window.casami.shopping.add(text)),
    toggle: (id: ID) => unwrap(window.casami.shopping.toggle(id)),
    remove: (id: ID) => unwrap(window.casami.shopping.remove(id)),
    clearDone: () => unwrap(window.casami.shopping.clearDone())
  },
  settings: {
    get: () => unwrap(window.casami.settings.get()),
    update: (patch: Partial<Settings>) => unwrap(window.casami.settings.update(patch))
  },
  backup: {
    pickFolder: () => unwrap(window.casami.backup.pickFolder()),
    exportNow: (folder?: string) => unwrap(window.casami.backup.exportNow(folder)),
    importNow: () => unwrap(window.casami.backup.importNow()),
    autoIfDue: () => unwrap(window.casami.backup.autoIfDue())
  },
  app: {
    version: () => unwrap(window.casami.app.version()),
    openExternal: (url: string) => unwrap(window.casami.app.openExternal(url)),
    savePdf: (fileName: string) => unwrap(window.casami.app.savePdf(fileName))
  },
  updater: {
    check: () => unwrap(window.casami.updater.check()),
    download: () => unwrap(window.casami.updater.download()),
    install: () => unwrap(window.casami.updater.install()),
    status: () => unwrap(window.casami.updater.status()),
    onStatus: (listener: (status: UpdateStatus) => void) =>
      window.casami.updater.onStatus(listener)
  }
}
