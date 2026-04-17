import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isToday,
  isYesterday,
  addMonths,
  subMonths,
  addDays,
  differenceInCalendarDays,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { it } from 'date-fns/locale'

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function yesterdayIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return format(d, 'yyyy-MM-dd')
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function monthLabel(monthKey: string): string {
  const d = parseISO(`${monthKey}-01`)
  return format(d, 'MMMM yyyy', { locale: it })
}

export function monthLabelShort(monthKey: string): string {
  const d = parseISO(`${monthKey}-01`)
  return format(d, 'MMM yyyy', { locale: it })
}

export function previousMonth(monthKey: string): string {
  const d = parseISO(`${monthKey}-01`)
  return format(subMonths(d, 1), 'yyyy-MM')
}

export function nextMonth(monthKey: string): string {
  const d = parseISO(`${monthKey}-01`)
  return format(addMonths(d, 1), 'yyyy-MM')
}

export function prettyDate(iso: string): string {
  const d = parseISO(iso)
  if (isToday(d)) return 'Oggi'
  if (isYesterday(d)) return 'Ieri'
  return format(d, 'EEEE d MMMM', { locale: it })
}

export function shortDate(iso: string): string {
  const d = parseISO(iso)
  return format(d, 'd MMM', { locale: it })
}

export function longDate(iso: string): string {
  const d = parseISO(iso)
  return format(d, 'd MMMM yyyy', { locale: it })
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export function daysInMonth(monthKey: string): number {
  const start = parseISO(`${monthKey}-01`)
  return endOfMonth(start).getDate()
}

export function weekStartIso(iso: string): string {
  const d = parseISO(iso)
  return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function weekEndIso(iso: string): string {
  const d = parseISO(iso)
  return format(endOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export function monthStartIso(monthKey: string): string {
  return format(startOfMonth(parseISO(`${monthKey}-01`)), 'yyyy-MM-dd')
}

export function monthEndIso(monthKey: string): string {
  return format(endOfMonth(parseISO(`${monthKey}-01`)), 'yyyy-MM-dd')
}

export function addDaysIso(iso: string, n: number): string {
  return format(addDays(parseISO(iso), n), 'yyyy-MM-dd')
}

export function isOverdue(dueIso: string, todayIsoStr: string, paidOn: string | null): boolean {
  if (paidOn) return false
  return dueIso < todayIsoStr
}

export function daysUntil(iso: string, fromIso: string): number {
  return differenceInCalendarDays(parseISO(iso), parseISO(fromIso))
}

export type MonthCell = {
  iso: string
  inMonth: boolean
  isToday: boolean
  weekday: number
}

export function monthMatrix(monthKey: string, todayIsoStr: string): MonthCell[] {
  const first = parseISO(`${monthKey}-01`)
  const gridStart = startOfWeek(startOfMonth(first), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(first), { weekStartsOn: 1 })
  const cells: MonthCell[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    const iso = format(cursor, 'yyyy-MM-dd')
    cells.push({
      iso,
      inMonth: format(cursor, 'yyyy-MM') === monthKey,
      isToday: iso === todayIsoStr,
      weekday: cursor.getDay()
    })
    cursor = addDays(cursor, 1)
  }
  return cells
}

export function groupByWeek<T extends { dueDate: string }>(
  items: T[]
): Array<{ weekStart: string; weekEnd: string; items: T[] }> {
  const map = new Map<string, { weekStart: string; weekEnd: string; items: T[] }>()
  for (const item of items) {
    const ws = weekStartIso(item.dueDate)
    const we = weekEndIso(item.dueDate)
    const bucket = map.get(ws)
    if (bucket) bucket.items.push(item)
    else map.set(ws, { weekStart: ws, weekEnd: we, items: [item] })
  }
  return Array.from(map.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

export function weekLabel(weekStart: string, weekEnd: string): string {
  const a = parseISO(weekStart)
  const b = parseISO(weekEnd)
  const sameMonth = format(a, 'yyyy-MM') === format(b, 'yyyy-MM')
  if (sameMonth) return `${format(a, 'd')} – ${format(b, 'd MMMM', { locale: it })}`
  return `${format(a, 'd MMM', { locale: it })} – ${format(b, 'd MMM yyyy', { locale: it })}`
}

export { format, parseISO, startOfMonth, endOfMonth, isToday, isYesterday, differenceInCalendarDays, addDays, startOfWeek, endOfWeek }
