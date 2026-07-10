import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { TaskBackend } from './task-backend.cjs'

const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

async function withBackend(run: (backend: TaskBackend, directory: string) => Promise<void>) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'agent-studio-test-'))
  const backend = new TaskBackend(directory, 50)

  try {
    await backend.initialize()
    await run(backend, directory)
  } finally {
    await backend.dispose()
    await rm(directory, { recursive: true, force: true })
  }
}

test('creates, advances, pauses, and resumes a task', async () => {
  await withBackend(async backend => {
    const created = await backend.createTask('  Verify the persistent backend  ')
    assert.equal(created.taskTitle, 'Verify the persistent backend')
    assert.equal(created.taskStatus, 'running')
    assert.equal(created.progress, 0)
    assert.equal(created.steps.filter(step => step.state === 'current').length, 1)

    await delay(140)
    const advanced = backend.getSnapshot()
    assert.ok(advanced.progress > 0)

    const paused = await backend.pauseTask()
    const pausedProgress = paused.progress
    assert.equal(paused.taskStatus, 'paused')
    assert.ok(paused.tools.every(tool => tool.state === 'idle'))

    await delay(140)
    assert.equal(backend.getSnapshot().progress, pausedProgress)

    const resumed = await backend.runTask()
    assert.equal(resumed.taskStatus, 'running')
    await delay(80)
    assert.ok(backend.getSnapshot().progress > pausedProgress)
  })
})

test('persists state and recovers running work as paused', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'agent-studio-recovery-'))
  const first = new TaskBackend(directory, 50)

  try {
    await first.initialize()
    await first.createTask('Persist this task')
    await delay(80)
    await first.dispose()

    const recovered = new TaskBackend(directory, 50)
    const snapshot = await recovered.initialize()
    assert.equal(snapshot.taskTitle, 'Persist this task')
    assert.equal(snapshot.taskStatus, 'paused')
    assert.ok(snapshot.logs.some(log => log.message.includes('recovered in paused state')))
    await recovered.dispose()
  } finally {
    await first.dispose()
    await rm(directory, { recursive: true, force: true })
  }
})

test('completes all phases and writes a real artifact', async () => {
  await withBackend(async backend => {
    await backend.createTask('Generate a result artifact')
    await delay(2_800)

    const completed = backend.getSnapshot()
    assert.equal(completed.taskStatus, 'complete')
    assert.equal(completed.progress, 100)
    assert.ok(completed.steps.every(step => step.state === 'done'))
    assert.ok(completed.tools.every(tool => tool.state === 'idle'))

    const artifact = completed.timeline.find(item => item.kind === 'artifact')
    assert.ok(artifact && artifact.kind === 'artifact' && artifact.artifactPath)
    const payload = JSON.parse(await readFile(artifact.artifactPath, 'utf8')) as {
      title: string
      status: string
      progress: number
      steps: Array<{ state: string }>
    }
    assert.equal(payload.title, 'Generate a result artifact')
    assert.equal(payload.status, 'complete')
    assert.equal(payload.progress, 100)
    assert.ok(payload.steps.every(step => step.state === 'done'))

    const cleared = await backend.clearLogs()
    assert.equal(cleared.logs.length, 0)
  })
})

test('rejects empty and oversized task descriptions', async () => {
  await withBackend(async backend => {
    await assert.rejects(() => backend.createTask('   '), /required/)
    await assert.rejects(() => backend.createTask('x'.repeat(10_001)), /10,000/)
  })
})

test('serializes a replacement task with an in-flight phase transition', async () => {
  await withBackend(async backend => {
    await backend.createTask('First task')
    await delay(1_050)
    const replacement = await backend.createTask('Replacement task')

    assert.equal(replacement.taskTitle, 'Replacement task')
    assert.equal(replacement.progress, 0)
    assert.equal(replacement.timeline.length, 1)
    assert.ok(replacement.timeline.every(item => !('artifactLabel' in item)))
  })
})

test('recovers safely from a structurally invalid state file', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'agent-studio-invalid-'))
  const dataRoot = path.join(directory, 'agent-studio')
  await mkdir(dataRoot, { recursive: true })
  await writeFile(path.join(dataRoot, 'state.v1.json'), JSON.stringify({
    schemaVersion: 1,
    snapshot: { taskStatus: 'running' },
    runtime: {},
  }), 'utf8')
  const backend = new TaskBackend(directory, 50)

  try {
    const snapshot = await backend.initialize()
    assert.equal(snapshot.taskStatus, 'paused')
    assert.ok(snapshot.steps.length > 0)
    assert.ok((await readdir(dataRoot)).some(name => name.startsWith('state.v1.json.corrupt-')))
  } finally {
    await backend.dispose()
    await rm(directory, { recursive: true, force: true })
  }
})
