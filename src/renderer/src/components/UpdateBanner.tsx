import { useEffect, useState } from 'react'
import { Download, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { UpdateStatus } from '@shared/types'
import { it } from '@shared/i18n'
import { ipc } from '../lib/ipc'
import { Button } from './Button'

function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template
  )
}

export function UpdateBanner() {
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    ipc.updater
      .status()
      .then((s) => {
        if (!cancelled) setStatus(s)
      })
      .catch(() => {})
    const unsubscribe = ipc.updater.onStatus((next) => {
      setStatus(next)
      setDismissed(false)
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  if (dismissed) return null
  if (status.state === 'idle' || status.state === 'not-available' || status.state === 'checking') {
    return null
  }

  const handleDownload = async (): Promise<void> => {
    try {
      await ipc.updater.download()
    } catch {
      /* status event will reflect error */
    }
  }

  const handleInstall = async (): Promise<void> => {
    try {
      await ipc.updater.install()
    } catch {
      /* no-op */
    }
  }

  const base =
    'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-pop px-5 py-4 flex items-center gap-4 min-w-[360px] max-w-[92vw] border border-cream-300 animate-fadeIn'

  if (status.state === 'available') {
    return (
      <div role="status" className={base}>
        <Download className="text-terracotta-500 shrink-0" size={24} />
        <div className="flex-1">
          <div className="font-heading font-bold text-ink-700">{it.updater.available}</div>
          <div className="text-sm text-ink-500">
            {interpolate(it.updater.availableBody, { version: status.version })}
          </div>
        </div>
        <Button size="md" onClick={handleDownload}>
          {it.updater.download}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          aria-label={it.updater.later}
          className="p-2 rounded-lg text-ink-500 hover:bg-cream-200"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  if (status.state === 'downloading') {
    const percent = Math.max(0, Math.min(100, Math.round(status.percent)))
    return (
      <div role="status" className={base}>
        <RefreshCw className="text-terracotta-500 shrink-0 animate-spin" size={24} />
        <div className="flex-1">
          <div className="font-heading font-bold text-ink-700">{it.updater.downloading}</div>
          <div className="mt-2 h-2 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-400 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-sm text-ink-500 mt-1">
            {interpolate(it.updater.downloadingPercent, { percent })}
          </div>
        </div>
      </div>
    )
  }

  if (status.state === 'downloaded') {
    return (
      <div role="status" className={base}>
        <CheckCircle2 className="text-olive-500 shrink-0" size={24} />
        <div className="flex-1">
          <div className="font-heading font-bold text-ink-700">{it.updater.ready}</div>
          <div className="text-sm text-ink-500">
            {interpolate(it.updater.readyBody, { version: status.version })}
          </div>
        </div>
        <Button size="md" onClick={handleInstall}>
          {it.updater.installNow}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          aria-label={it.updater.later}
          className="p-2 rounded-lg text-ink-500 hover:bg-cream-200"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  if (status.state === 'error') {
    return (
      <div role="alert" className={base}>
        <AlertTriangle className="text-danger-500 shrink-0" size={24} />
        <div className="flex-1">
          <div className="font-heading font-bold text-ink-700">{it.updater.errorTitle}</div>
          <div className="text-sm text-ink-500">
            {interpolate(it.updater.errorBody, { message: status.message })}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label={it.common.close}
          className="p-2 rounded-lg text-ink-500 hover:bg-cream-200"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  return null
}
