import { app, BrowserWindow, ipcMain } from 'electron'
import electronUpdaterPkg from 'electron-updater'
import log from 'electron-log'

const { autoUpdater } = electronUpdaterPkg

type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'not-available'; version: string }
  | { state: 'downloading'; percent: number; transferred: number; total: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }

let lastStatus: UpdateStatus = { state: 'idle' }

function broadcast(status: UpdateStatus): void {
  lastStatus = status
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('updater:status', status)
    }
  }
}

export function initUpdater(): void {
  log.transports.file.level = 'info'
  autoUpdater.logger = log
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => broadcast({ state: 'checking' }))

  autoUpdater.on('update-available', (info) =>
    broadcast({ state: 'available', version: info.version })
  )

  autoUpdater.on('update-not-available', (info) =>
    broadcast({ state: 'not-available', version: info.version })
  )

  autoUpdater.on('download-progress', (progress) =>
    broadcast({
      state: 'downloading',
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    })
  )

  autoUpdater.on('update-downloaded', (info) =>
    broadcast({ state: 'downloaded', version: info.version })
  )

  autoUpdater.on('error', (err) =>
    broadcast({ state: 'error', message: err instanceof Error ? err.message : 'Errore updater' })
  )

  ipcMain.handle('updater:check', async () => {
    if (!app.isPackaged) return { ok: false, error: 'Updater disabilitato in dev' }
    try {
      const result = await autoUpdater.checkForUpdates()
      return { ok: true, value: result?.updateInfo?.version ?? null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      return { ok: false, error: message }
    }
  })

  ipcMain.handle('updater:download', async () => {
    if (!app.isPackaged) return { ok: false, error: 'Updater disabilitato in dev' }
    try {
      await autoUpdater.downloadUpdate()
      return { ok: true, value: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      return { ok: false, error: message }
    }
  })

  ipcMain.handle('updater:install', async () => {
    try {
      autoUpdater.quitAndInstall(false, true)
      return { ok: true, value: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      return { ok: false, error: message }
    }
  })

  ipcMain.handle('updater:status', async () => ({ ok: true, value: lastStatus }))
}

export function scheduleUpdateChecks(): void {
  if (!app.isPackaged) return
  const runCheck = (): void => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn('Auto update check failed', err)
    })
  }
  setTimeout(runCheck, 10_000)
  setInterval(runCheck, 6 * 60 * 60 * 1000)
}
