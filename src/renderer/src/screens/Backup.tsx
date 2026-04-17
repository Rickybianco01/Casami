import { useState } from 'react'
import { Download, Upload, FolderOpen } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Biscotto } from '../mascot/Biscotto'
import { useSettingsStore } from '../stores/settingsStore'
import { useBootstrap } from '../stores/bootstrap'
import { ipc } from '../lib/ipc'
import { it } from '@shared/i18n'

export function BackupScreen() {
  const { settings, update } = useSettingsStore()
  const bootstrap = useBootstrap((s) => s.load)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function pickFolder() {
    const folder = await ipc.backup.pickFolder()
    if (folder) {
      await update({ backupFolder: folder })
    }
  }

  async function doExport() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await ipc.backup.exportNow(settings?.backupFolder ?? undefined)
      if (res) {
        setMsg({ kind: 'ok', text: `${it.backup.exportSuccess} (${res})` })
      } else {
        setMsg({ kind: 'err', text: it.backup.exportError })
      }
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : it.backup.exportError })
    } finally {
      setBusy(false)
    }
  }

  async function doImport() {
    setConfirmOpen(false)
    setBusy(true)
    setMsg(null)
    try {
      const res = await ipc.backup.importNow()
      if (res) {
        setMsg({ kind: 'ok', text: it.backup.restoreSuccess })
        await bootstrap()
      }
    } catch (err) {
      setMsg({ kind: 'err', text: err instanceof Error ? err.message : it.backup.restoreError })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <TopBar title={it.backup.title} back />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="card flex items-start gap-4">
          <Biscotto mood="thinking" size={80} />
          <p className="text-ink-500 text-lg">{it.backup.description}</p>
        </div>

        <div className="card space-y-3">
          <p className="label">{it.settings.backupFolder}</p>
          <p className="text-ink-500 text-sm break-all">{settings?.backupFolder ?? '—'}</p>
          <Button variant="secondary" size="md" onClick={pickFolder}>
            <FolderOpen size={18} /> {it.settings.choose}
          </Button>
        </div>

        {msg && (
          <div
            className={`card ${
              msg.kind === 'ok'
                ? 'bg-olive-500/10 border border-olive-500'
                : 'bg-danger-600/10 border border-danger-600'
            }`}
          >
            <p className={msg.kind === 'ok' ? 'text-olive-600 font-semibold' : 'text-danger-600 font-semibold'}>
              {msg.text}
            </p>
          </div>
        )}

        <Button size="xl" block onClick={doExport} disabled={busy}>
          <Download size={22} /> {it.backup.exportBtn}
        </Button>

        <div className="card space-y-3 border-2 border-danger-600/20">
          <p className="text-danger-600 font-semibold">{it.settings.restoreWarn}</p>
          <Button
            variant="danger"
            size="lg"
            block
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
          >
            <Upload size={20} /> {it.backup.restoreBtn}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={it.backup.restoreConfirm}
        body={it.settings.restoreWarn}
        confirmLabel={it.backup.restoreGo}
        cancelLabel={it.common.cancel}
        danger
        onConfirm={doImport}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
