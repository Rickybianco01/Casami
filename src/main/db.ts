import { app } from 'electron'
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { nanoid } from 'nanoid'
import type {
  DBSchema,
  Category,
  Expense,
  Budget,
  RecurringExpense,
  ShoppingItem,
  Settings,
  MonthlySummary,
  ID
} from '@shared/types'
import { DEFAULT_CATEGORIES, initialDB, SCHEMA_VERSION } from '@shared/defaults'

let db: Low<DBSchema> | null = null
let dbFilePath = ''

function dataDir(): string {
  const dir = join(app.getPath('userData'), 'data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function safeBackupOnLoad(filePath: string) {
  if (!existsSync(filePath)) return
  const backupDir = join(dataDir(), 'auto-safe-backup')
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dest = join(backupDir, `casami-${stamp}.json`)
  try {
    copyFileSync(filePath, dest)
  } catch {
    /* best effort */
  }
}

export async function initDB(): Promise<void> {
  dbFilePath = join(dataDir(), 'casami.json')
  safeBackupOnLoad(dbFilePath)

  const adapter = new JSONFile<DBSchema>(dbFilePath)
  const fresh = initialDB()
  db = new Low<DBSchema>(adapter, fresh)
  await db.read()
  if (!db.data) db.data = fresh

  if (db.data.schemaVersion !== SCHEMA_VERSION) {
    db.data.schemaVersion = SCHEMA_VERSION
  }

  if (!db.data.categories || db.data.categories.length === 0) {
    db.data.categories = DEFAULT_CATEGORIES.map((c) => ({ ...c, id: nanoid(10) }))
  }

  db.data.settings = { ...fresh.settings, ...(db.data.settings ?? {}) }
  if (!Array.isArray(db.data.expenses)) db.data.expenses = []
  if (!Array.isArray(db.data.budgets)) db.data.budgets = []
  if (!Array.isArray(db.data.recurring)) db.data.recurring = []
  if (!Array.isArray(db.data.shopping)) db.data.shopping = []

  await db.write()
}

function getDB(): Low<DBSchema> {
  if (!db || !db.data) throw new Error('Database non inizializzato')
  return db
}

export function getDBPath(): string {
  return dbFilePath
}

async function persist(): Promise<void> {
  const d = getDB()
  await d.write()
}

function now(): string {
  return new Date().toISOString()
}

export async function listCategories(): Promise<Category[]> {
  const d = getDB()
  return [...d.data.categories].sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function createCategory(input: Omit<Category, 'id' | 'isDefault'>): Promise<Category> {
  const d = getDB()
  const cat: Category = { ...input, id: nanoid(10), isDefault: false }
  d.data.categories.push(cat)
  await persist()
  return cat
}

export async function updateCategory(id: ID, patch: Partial<Category>): Promise<Category> {
  const d = getDB()
  const idx = d.data.categories.findIndex((c) => c.id === id)
  if (idx < 0) throw new Error('Categoria non trovata')
  d.data.categories[idx] = { ...d.data.categories[idx], ...patch, id }
  await persist()
  return d.data.categories[idx]
}

export async function archiveCategory(id: ID, archived: boolean): Promise<void> {
  await updateCategory(id, { archived })
}

function liveExpenses(): Expense[] {
  const d = getDB()
  return d.data.expenses.filter((e) => e.deletedAt === null)
}

export async function listExpensesByMonth(month: string): Promise<Expense[]> {
  return liveExpenses()
    .filter((e) => e.occurredOn.startsWith(month))
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt.localeCompare(a.createdAt))
}

export async function listExpensesAll(): Promise<Expense[]> {
  return liveExpenses().sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
}

export async function getExpense(id: ID): Promise<Expense | null> {
  return getDB().data.expenses.find((e) => e.id === id) ?? null
}

export interface CreateExpenseInput {
  amountCents: number
  categoryId: ID
  occurredOn: string
  note?: string | null
  recurringExpenseId?: ID | null
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new Error('Importo non valido')
  }
  const d = getDB()
  if (!d.data.categories.some((c) => c.id === input.categoryId)) {
    throw new Error('Categoria non valida')
  }
  const e: Expense = {
    id: nanoid(10),
    amountCents: Math.round(input.amountCents),
    categoryId: input.categoryId,
    occurredOn: input.occurredOn,
    note: input.note ?? null,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
    recurringExpenseId: input.recurringExpenseId ?? null
  }
  d.data.expenses.push(e)
  await persist()
  return e
}

export async function updateExpense(id: ID, patch: Partial<CreateExpenseInput>): Promise<Expense> {
  const d = getDB()
  const idx = d.data.expenses.findIndex((e) => e.id === id)
  if (idx < 0) throw new Error('Spesa non trovata')
  const cur = d.data.expenses[idx]
  const next: Expense = {
    ...cur,
    ...patch,
    id: cur.id,
    updatedAt: now()
  } as Expense
  if (next.amountCents <= 0 || !Number.isFinite(next.amountCents)) {
    throw new Error('Importo non valido')
  }
  d.data.expenses[idx] = next
  await persist()
  return next
}

export async function softDeleteExpense(id: ID): Promise<void> {
  const d = getDB()
  const idx = d.data.expenses.findIndex((e) => e.id === id)
  if (idx < 0) return
  d.data.expenses[idx].deletedAt = now()
  await persist()
}

export async function restoreExpense(id: ID): Promise<void> {
  const d = getDB()
  const idx = d.data.expenses.findIndex((e) => e.id === id)
  if (idx < 0) return
  d.data.expenses[idx].deletedAt = null
  d.data.expenses[idx].updatedAt = now()
  await persist()
}

export async function sweepDeleted(olderThanHours = 24): Promise<void> {
  const d = getDB()
  const cutoff = Date.now() - olderThanHours * 60 * 60 * 1000
  const kept = d.data.expenses.filter((e) => {
    if (e.deletedAt === null) return true
    return new Date(e.deletedAt).getTime() > cutoff
  })
  if (kept.length !== d.data.expenses.length) {
    d.data.expenses = kept
    await persist()
  }
}

export async function monthlySummary(month: string): Promise<MonthlySummary> {
  const expenses = await listExpensesByMonth(month)

  const prevMonthDate = new Date(`${month}-01T00:00:00Z`)
  prevMonthDate.setUTCMonth(prevMonthDate.getUTCMonth() - 1)
  const prevMonth = prevMonthDate.toISOString().slice(0, 7)
  const prevExpenses = await listExpensesByMonth(prevMonth)

  const total = expenses.reduce((s, e) => s + e.amountCents, 0)
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amountCents, 0)

  const byCat = new Map<ID, { totalCents: number; count: number }>()
  for (const e of expenses) {
    const cur = byCat.get(e.categoryId) ?? { totalCents: 0, count: 0 }
    cur.totalCents += e.amountCents
    cur.count += 1
    byCat.set(e.categoryId, cur)
  }

  const byCategory = Array.from(byCat.entries())
    .map(([categoryId, v]) => ({ categoryId, totalCents: v.totalCents, count: v.count }))
    .sort((a, b) => b.totalCents - a.totalCents)

  const top = byCategory.slice(0, 3).map((c) => ({ categoryId: c.categoryId, totalCents: c.totalCents }))

  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()
  const dailyAverage = daysInMonth > 0 ? Math.round(total / daysInMonth) : 0

  return {
    month,
    totalCents: total,
    byCategory,
    previousMonthTotalCents: prevTotal,
    topCategories: top,
    dailyAverageCents: dailyAverage,
    count: expenses.length
  }
}

export async function listBudgets(): Promise<Budget[]> {
  return [...getDB().data.budgets]
}

export async function upsertBudget(input: Omit<Budget, 'id'>): Promise<Budget> {
  const d = getDB()
  const existing = d.data.budgets.find(
    (b) => b.categoryId === input.categoryId && b.month === input.month
  )
  if (existing) {
    existing.amountCents = input.amountCents
    await persist()
    return existing
  }
  const b: Budget = { ...input, id: nanoid(10) }
  d.data.budgets.push(b)
  await persist()
  return b
}

export async function removeBudget(id: ID): Promise<void> {
  const d = getDB()
  d.data.budgets = d.data.budgets.filter((b) => b.id !== id)
  await persist()
}

export async function listRecurring(): Promise<RecurringExpense[]> {
  return [...getDB().data.recurring]
}

export async function createRecurring(
  input: Omit<RecurringExpense, 'id' | 'createdAt'>
): Promise<RecurringExpense> {
  const d = getDB()
  const r: RecurringExpense = { ...input, id: nanoid(10), createdAt: now() }
  d.data.recurring.push(r)
  await persist()
  return r
}

export async function updateRecurring(
  id: ID,
  patch: Partial<RecurringExpense>
): Promise<RecurringExpense> {
  const d = getDB()
  const idx = d.data.recurring.findIndex((r) => r.id === id)
  if (idx < 0) throw new Error('Ricorrenza non trovata')
  d.data.recurring[idx] = { ...d.data.recurring[idx], ...patch, id }
  await persist()
  return d.data.recurring[idx]
}

export async function removeRecurring(id: ID): Promise<void> {
  const d = getDB()
  d.data.recurring = d.data.recurring.filter((r) => r.id !== id)
  await persist()
}

export async function listShopping(): Promise<ShoppingItem[]> {
  return [...getDB().data.shopping].sort(
    (a, b) => Number(a.checked) - Number(b.checked) || a.createdAt.localeCompare(b.createdAt)
  )
}

export async function addShoppingItem(text: string): Promise<ShoppingItem> {
  const d = getDB()
  const item: ShoppingItem = {
    id: nanoid(10),
    text: text.trim(),
    checked: false,
    createdAt: now()
  }
  if (!item.text) throw new Error('Testo vuoto')
  d.data.shopping.push(item)
  await persist()
  return item
}

export async function toggleShoppingItem(id: ID): Promise<void> {
  const d = getDB()
  const it = d.data.shopping.find((i) => i.id === id)
  if (!it) return
  it.checked = !it.checked
  await persist()
}

export async function removeShoppingItem(id: ID): Promise<void> {
  const d = getDB()
  d.data.shopping = d.data.shopping.filter((i) => i.id !== id)
  await persist()
}

export async function clearCheckedShopping(): Promise<void> {
  const d = getDB()
  d.data.shopping = d.data.shopping.filter((i) => !i.checked)
  await persist()
}

export async function getSettings(): Promise<Settings> {
  return { ...getDB().data.settings }
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const d = getDB()
  d.data.settings = { ...d.data.settings, ...patch }
  await persist()
  return d.data.settings
}

export async function exportBackupFile(destPath: string): Promise<string> {
  const d = getDB()
  const payload = {
    productName: 'Casami' as const,
    version: SCHEMA_VERSION,
    exportedAt: now(),
    data: d.data
  }
  const dir = dirname(destPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(destPath, JSON.stringify(payload, null, 2), 'utf-8')
  d.data.settings.lastBackupAt = payload.exportedAt
  await persist()
  return destPath
}

export async function importBackup(payloadText: string): Promise<void> {
  let parsed: { productName?: string; version?: number; data?: DBSchema }
  try {
    parsed = JSON.parse(payloadText)
  } catch {
    throw new Error('Il file non è un backup valido.')
  }
  if (parsed.productName !== 'Casami') throw new Error('Il file non è un backup di Casami.')
  if (!parsed.data || typeof parsed.data !== 'object') throw new Error('Dati mancanti nel backup.')
  if (!Array.isArray(parsed.data.expenses) || !Array.isArray(parsed.data.categories)) {
    throw new Error('Struttura del backup non riconosciuta.')
  }
  const d = getDB()
  const safetyPath = join(dataDir(), 'pre-restore-backup.json')
  writeFileSync(safetyPath, JSON.stringify(d.data, null, 2), 'utf-8')

  d.data = {
    ...initialDB(),
    ...parsed.data,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...initialDB().settings, ...parsed.data.settings }
  }
  await persist()
}
