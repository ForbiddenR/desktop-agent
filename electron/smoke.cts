import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { TaskBackend } from './task-backend.cjs'
import { registerTaskIpc } from './task-ipc.cjs'

const projectRoot = path.join(__dirname, '..')

app.disableHardwareAcceleration()

const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

async function waitFor(window: BrowserWindow, expression: string, timeout = 5_000) {
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    if (await window.webContents.executeJavaScript(`Boolean(${expression})`)) {
      return
    }

    await delay(50)
  }

  throw new Error(`Timed out waiting for: ${expression}`)
}

app.whenReady().then(async () => {
  const dataDirectory = await mkdtemp(path.join(os.tmpdir(), 'agent-studio-smoke-'))
  const backend = new TaskBackend(dataDirectory, 50)
  await backend.initialize()

  const window = new BrowserWindow({
    width: 1240,
    height: 1000,
    show: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })
  const rendererEntry = path.join(projectRoot, 'dist', 'index.html')
  const unregisterIpc = registerTaskIpc({
    backend,
    getMainWindow: () => window,
    isTrustedUrl: url => url === `file://${rendererEntry}`,
  })
  const unsubscribe = backend.subscribe(snapshot => {
    if (!window.isDestroyed()) {
      window.webContents.send('agent:state-changed', snapshot)
    }
  })

  try {
    await window.loadFile(rendererEntry)
    await waitFor(window, `window.desktop?.agent && document.querySelector('#agent-prompt')`)
    await waitFor(window, `document.body.innerText.includes('Paused')`)

    await window.webContents.executeJavaScript(`(() => {
      const input = document.querySelector('#agent-prompt')
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
      setter.call(input, 'Headless backend task')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      document.querySelector('button[aria-label="Send prompt"]').click()
    })()`)
    await waitFor(window, `document.querySelector('.task-header h1')?.textContent === 'Headless backend task'`)
    assert.equal(backend.getSnapshot().taskStatus, 'running')

    await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('.topbar__actions button')).find(button => button.textContent.includes('Pause')).click()`)
    await waitFor(window, `document.querySelector('.task-header')?.innerText.includes('Paused')`)
    const pausedProgress = backend.getSnapshot().progress
    await delay(180)
    assert.equal(backend.getSnapshot().progress, pausedProgress)

    await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('.topbar__actions button')).find(button => button.textContent.includes('Run')).click()`)
    await waitFor(window, `Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')) > ${pausedProgress}`)

    await waitFor(window, `document.querySelector('.task-header')?.innerText.includes('Complete')`, 5_000)
    const completed = backend.getSnapshot()
    assert.equal(completed.progress, 100)
    assert.ok(completed.steps.every(step => step.state === 'done'))
    assert.ok(completed.timeline.some(item => item.kind === 'artifact'))

    await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('.logs-panel__actions button')).find(button => button.textContent.trim() === 'Clear').click()`)
    await waitFor(window, `document.querySelectorAll('.log-row').length === 0`)
    assert.equal(backend.getSnapshot().logs.length, 0)

    const railMetrics = await window.webContents.executeJavaScript(`(() => {
      const rail = document.querySelector('.right-rail')
      const steps = document.querySelector('.steps-card')
      const topbarCenter = document.querySelector('.topbar__center')
      const topbarActions = document.querySelector('.topbar__actions')
      const railRect = rail.getBoundingClientRect()
      const stepsRect = steps.getBoundingClientRect()
      const centerRect = topbarCenter.getBoundingClientRect()
      const actionsRect = topbarActions.getBoundingClientRect()
      return {
        railScrollHeight: rail.scrollHeight,
        railClientHeight: rail.clientHeight,
        stepsVisible: stepsRect.bottom <= railRect.bottom + 0.5,
        topbarNoOverlap: centerRect.right <= actionsRect.left + 0.5,
      }
    })()`)
    assert.equal(railMetrics.stepsVisible, true)
    assert.equal(railMetrics.topbarNoOverlap, true)

    const domState = await window.webContents.executeJavaScript(`({
      status: document.querySelector('.task-header .status-pill')?.textContent.trim(),
      progress: Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
      completedSteps: document.querySelectorAll('.steps-list__item.is-done').length,
    })`)
    assert.equal(domState.status, 'Complete')
    assert.equal(domState.progress, 100)
    assert.equal(domState.completedSteps, 5)

    // The window stays hidden during the interaction. Expose it briefly on the
    // virtual X display so Chromium commits the final DOM state before capture.
    window.showInactive()
    await delay(100)
    const screenshot = await window.webContents.capturePage()
    await writeFile(path.join(os.tmpdir(), 'agent-studio-backend-smoke.png'), screenshot.toPNG())
    process.stdout.write(`${JSON.stringify({ status: 'ok', completedProgress: completed.progress, domState, railMetrics })}\n`)
  } finally {
    unsubscribe()
    unregisterIpc()
    await backend.dispose()
    window.destroy()
    await rm(dataDirectory, { recursive: true, force: true })
    app.quit()
  }
}).catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  app.exit(1)
})
