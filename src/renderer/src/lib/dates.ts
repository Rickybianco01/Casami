import { format, parseISO, startOfMonth, endOfMonth, isToday, isYesterday, addMonths, subMonths, differenceInCalendarDays } from 'date-fns'
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

export { format, parseISO, startOfMonth, endOfMonth, isToday, isYesterday, differenceInCalendarDays }
