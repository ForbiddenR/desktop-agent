import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type TaskStatus = 'running' | 'paused' | 'complete'
export type StepState = 'done' | 'current' | 'todo'

export type TaskStep = {
  id: string
  label: string
  state: StepState
}

export type TaskTool = {
  id: string
  name: string
  detail: string
  state: 'active' | 'idle'
  accent: 'purple' | 'blue' | 'green' | 'amber' | 'slate'
}

export type TaskContext = {
  id: string
  label: string
  kind: 'docs' | 'folder' | 'file'
  path?: string
}

export type TaskLog = {
  id: string
  time: string
  source: string
  message: string
}

type TimelineSummary = {
  id: string
  kind: 'summary'
  actor: string
  time: string
  text: string
  checklist: TaskStep[]
}

type TimelineTool = {
  id: string
  kind: 'tool'
  tool: string
  time: string
  text: string
  meta?: string
  accent: TaskTool['accent']
}

type TimelineCode = {
  id: string
  kind: 'code'
  tool: string
  time: string
  file: string
  language: string
  lines: string[]
  accent: TaskTool['accent']
}

type TimelineArtifact = {
  id: string
  kind: 'artifact'
  tool: string
  time: string
  text: string
  artifactLabel: string
  artifactPath?: string
  accent: TaskTool['accent']
}

export type TaskTimelineItem = TimelineSummary | TimelineTool | TimelineCode | TimelineArtifact

export type TaskSnapshot = {
  revision: number
  taskId: string
  taskTitle: string
  taskStatus: TaskStatus
  progress: number
  startedAt: string
  elapsed: string
  estimatedFinish: string
  steps: TaskStep[]
  tools: TaskTool[]
  contextItems: TaskContext[]
  timeline: TaskTimelineItem[]
  logs: TaskLog[]
}

type RuntimeState = {
  elapsedSeconds: number
  phaseIndex: number
  lastResumedAt: number | null
}

type PersistedState = {
  schemaVersion: 1
  snapshot: TaskSnapshot
  runtime: RuntimeState
}

type Listener = (snapshot: TaskSnapshot) => void

const phaseProgress = [20, 40, 65, 82, 100]
const defaultSteps: TaskStep[] = [
  { id: 'requirements', label: 'Understand requirements', state: 'done' },
  { id: 'docs', label: 'Search and review relevant docs', state: 'done' },
  { id: 'implementation', label: 'Implement the requested task', state: 'current' },
  { id: 'package', label: 'Create result artifact and metadata', state: 'todo' },
  { id: 'validate', label: 'Validate and finalize the result', state: 'todo' },
]

const defaultTools: TaskTool[] = [
  { id: 'web-search', name: 'Research', detail: 'Reviewing context…', state: 'active', accent: 'green' },
  { id: 'code-write', name: 'Task Engine', detail: 'Executing task', state: 'active', accent: 'blue' },
  { id: 'file-system', name: 'File System', detail: 'Preparing artifacts', state: 'active', accent: 'amber' },
]

function timeLabel(date = new Date()) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function logTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour12: false })
}

function durationLabel(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  if (minutes === 0) {
    return `${remainder}s`
  }

  return `${minutes}m ${remainder.toString().padStart(2, '0')}s`
}

function copySnapshot(snapshot: TaskSnapshot) {
  return structuredClone(snapshot)
}

function initialState(): PersistedState {
  const steps = structuredClone(defaultSteps)

  return {
    schemaVersion: 1,
    snapshot: {
      revision: 1,
      taskId: randomUUID(),
      taskTitle: 'Build a CLI that scrapes documentation and generates a skill',
      taskStatus: 'paused',
      progress: 61,
      startedAt: `Today, ${timeLabel()}`,
      elapsed: '3m 42s',
      estimatedFinish: timeLabel(new Date(Date.now() + 5 * 60_000)),
      steps,
      tools: defaultTools.map(tool => ({ ...tool, state: 'idle', detail: 'Paused' })),
      contextItems: [
        { id: 'scraper-guide', label: 'web-scraper-guide.md', kind: 'docs' },
        { id: 'cli-practices', label: 'cli-best-practices.md', kind: 'docs' },
        { id: 'structure', label: 'project-structure.md', kind: 'docs' },
        { id: 'src-folder', label: 'src/', kind: 'folder' },
        { id: 'requirements-file', label: 'requirements.txt', kind: 'file' },
      ],
      timeline: [
        {
          id: 'summary',
          kind: 'summary',
          actor: 'Agent Orchestrator',
          time: timeLabel(),
          text: 'This task is managed by the local Agent Studio execution backend.',
          checklist: structuredClone(steps),
        },
        {
          id: 'backend-ready',
          kind: 'tool',
          tool: 'Task Engine',
          time: timeLabel(),
          text: 'Restored task state from local storage',
          accent: 'blue',
        },
      ],
      logs: [
        {
          id: randomUUID(),
          time: logTime(),
          source: 'Task Engine',
          message: 'Local persistent backend initialized',
        },
      ],
    },
    runtime: {
      elapsedSeconds: 222,
      phaseIndex: 2,
      lastResumedAt: null,
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTaskStep(value: unknown): value is TaskStep {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.label === 'string'
    && (value.state === 'done' || value.state === 'current' || value.state === 'todo')
}

function isTaskTool(value: unknown): value is TaskTool {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.detail === 'string'
    && (value.state === 'active' || value.state === 'idle')
    && ['purple', 'blue', 'green', 'amber', 'slate'].includes(String(value.accent))
}

function isTaskContext(value: unknown): value is TaskContext {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.label === 'string'
    && (value.kind === 'docs' || value.kind === 'folder' || value.kind === 'file')
    && (value.path === undefined || typeof value.path === 'string')
}

function isTaskLog(value: unknown): value is TaskLog {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.time === 'string'
    && typeof value.source === 'string'
    && typeof value.message === 'string'
}

function isTimelineItem(value: unknown): value is TaskTimelineItem {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.kind !== 'string') {
    return false
  }

  if (value.kind === 'summary') {
    return typeof value.actor === 'string'
      && typeof value.time === 'string'
      && typeof value.text === 'string'
      && Array.isArray(value.checklist)
      && value.checklist.every(isTaskStep)
  }

  if (value.kind === 'tool') {
    return typeof value.tool === 'string'
      && typeof value.time === 'string'
      && typeof value.text === 'string'
  }

  if (value.kind === 'code') {
    return typeof value.tool === 'string'
      && typeof value.time === 'string'
      && typeof value.file === 'string'
      && typeof value.language === 'string'
      && Array.isArray(value.lines)
      && value.lines.every(line => typeof line === 'string')
  }

  if (value.kind === 'artifact') {
    return typeof value.tool === 'string'
      && typeof value.time === 'string'
      && typeof value.text === 'string'
      && typeof value.artifactLabel === 'string'
      && (value.artifactPath === undefined || typeof value.artifactPath === 'string')
  }

  return false
}

function isPersistedState(value: unknown): value is PersistedState {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.snapshot) || !isRecord(value.runtime)) {
    return false
  }

  const snapshot = value.snapshot
  const runtime = value.runtime
  const status = snapshot.taskStatus

  return Number.isFinite(snapshot.revision)
    && typeof snapshot.taskId === 'string'
    && typeof snapshot.taskTitle === 'string'
    && (status === 'running' || status === 'paused' || status === 'complete')
    && Number.isFinite(snapshot.progress)
    && typeof snapshot.startedAt === 'string'
    && typeof snapshot.elapsed === 'string'
    && typeof snapshot.estimatedFinish === 'string'
    && Array.isArray(snapshot.steps)
    && snapshot.steps.every(isTaskStep)
    && Array.isArray(snapshot.tools)
    && snapshot.tools.every(isTaskTool)
    && Array.isArray(snapshot.contextItems)
    && snapshot.contextItems.every(isTaskContext)
    && Array.isArray(snapshot.timeline)
    && snapshot.timeline.every(isTimelineItem)
    && Array.isArray(snapshot.logs)
    && snapshot.logs.every(isTaskLog)
    && Number.isFinite(runtime.elapsedSeconds)
    && Number.isInteger(runtime.phaseIndex)
    && (runtime.lastResumedAt === null || Number.isFinite(runtime.lastResumedAt))
}

export class TaskBackend {
  private readonly statePath: string
  private readonly artifactRoot: string
  private readonly tickMs: number
  private state = initialState()
  private timer: NodeJS.Timeout | null = null
  private tickInFlight = false
  private disposed = false
  private listeners = new Set<Listener>()
  private mutationQueue: Promise<void> = Promise.resolve()
  private writeQueue: Promise<void> = Promise.resolve()

  constructor(userDataPath: string, tickMs = 1_000) {
    const dataRoot = path.join(userDataPath, 'agent-studio')
    this.statePath = path.join(dataRoot, 'state.v1.json')
    this.artifactRoot = path.join(dataRoot, 'artifacts')
    this.tickMs = Math.max(50, tickMs)
  }

  async initialize() {
    await mkdir(path.dirname(this.statePath), { recursive: true })
    await mkdir(this.artifactRoot, { recursive: true })

    try {
      const parsed: unknown = JSON.parse(await readFile(this.statePath, 'utf8'))

      if (!isPersistedState(parsed)) {
        throw new Error('Unsupported Agent Studio state file')
      }

      this.state = parsed

      if (this.state.snapshot.taskStatus === 'running') {
        this.state.snapshot.taskStatus = 'paused'
        this.state.runtime.lastResumedAt = null
        this.setTools(false, 'Paused after application restart')
        this.appendLog('Task Engine', 'Running task recovered in paused state after application restart')
        await this.commit()
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code

      if (code !== 'ENOENT') {
        try {
          await rename(this.statePath, `${this.statePath}.corrupt-${Date.now()}`)
        } catch {
          // The original read error is enough context; a missing corrupt file needs no extra handling.
        }
      }

      this.state = initialState()
      await this.persist()
    }

    return this.getSnapshot()
  }

  getSnapshot() {
    this.refreshElapsed()
    return copySnapshot(this.state.snapshot)
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async createTask(prompt: string) {
    const title = prompt.trim()

    if (!title) {
      throw new Error('A task description is required')
    }

    if (title.length > 10_000) {
      throw new Error('Task descriptions are limited to 10,000 characters')
    }

    return this.enqueueMutation(async () => {
      this.stopTimer()
      const steps = defaultSteps.map((step, index) => ({
        ...step,
        state: index === 0 ? 'current' as const : 'todo' as const,
      }))
      const now = new Date()

      this.state = {
        schemaVersion: 1,
        snapshot: {
          revision: this.state.snapshot.revision + 1,
          taskId: randomUUID(),
          taskTitle: title,
          taskStatus: 'running',
          progress: 0,
          startedAt: `Today, ${timeLabel(now)}`,
          elapsed: '0s',
          estimatedFinish: timeLabel(new Date(now.getTime() + 50_000)),
          steps,
          tools: structuredClone(defaultTools),
          contextItems: structuredClone(this.state.snapshot.contextItems),
          timeline: [
            {
              id: randomUUID(),
              kind: 'summary',
              actor: 'Agent Orchestrator',
              time: timeLabel(now),
              text: `Started local execution for: ${title}`,
              checklist: structuredClone(steps),
            },
          ],
          logs: [
            {
              id: randomUUID(),
              time: logTime(now),
              source: 'Task Engine',
              message: `Task started: ${title}`,
            },
          ],
        },
        runtime: {
          elapsedSeconds: 0,
          phaseIndex: 0,
          lastResumedAt: Date.now(),
        },
      }

      await this.commit()
      this.startTimer()
      return this.getSnapshot()
    })
  }

  async runTask() {
    return this.enqueueMutation(async () => {
      if (this.state.snapshot.taskStatus === 'complete') {
        return this.getSnapshot()
      }

      if (this.state.snapshot.taskStatus !== 'running') {
        this.state.snapshot.taskStatus = 'running'
        this.state.runtime.lastResumedAt = Date.now()
        this.setTools(true, 'Execution resumed')
        this.appendLog('Task Engine', 'Task resumed')
        await this.commit()
      }

      this.startTimer()
      return this.getSnapshot()
    })
  }

  async pauseTask() {
    return this.enqueueMutation(async () => {
      if (this.state.snapshot.taskStatus !== 'running') {
        return this.getSnapshot()
      }

      this.refreshElapsed()
      this.state.snapshot.taskStatus = 'paused'
      this.state.runtime.lastResumedAt = null
      this.setTools(false, 'Paused')
      this.appendLog('Task Engine', 'Task paused')
      this.stopTimer()
      await this.commit()
      return this.getSnapshot()
    })
  }

  async clearLogs() {
    return this.enqueueMutation(async () => {
      this.state.snapshot.logs = []
      await this.commit()
      return this.getSnapshot()
    })
  }

  async addContext(paths: string[]) {
    return this.enqueueMutation(async () => {
      const existing = new Set(this.state.snapshot.contextItems.flatMap(item => item.path ? [item.path] : []))
      let added = 0

      for (const selectedPath of paths) {
        if (existing.has(selectedPath)) {
          continue
        }

        const extension = path.extname(selectedPath).toLowerCase()
        const kind: TaskContext['kind'] = extension === '.md' || extension === '.txt' ? 'docs' : 'file'
        this.state.snapshot.contextItems.push({
          id: randomUUID(),
          label: path.basename(selectedPath),
          kind,
          path: selectedPath,
        })
        existing.add(selectedPath)
        added += 1
      }

      if (added > 0) {
        this.appendLog('Context', `Added ${added} context item${added === 1 ? '' : 's'}`)
        await this.commit()
      }

      return this.getSnapshot()
    })
  }

  async addContextFolder(selectedPath: string) {
    return this.enqueueMutation(async () => {
      if (!this.state.snapshot.contextItems.some(item => item.path === selectedPath)) {
        this.state.snapshot.contextItems.push({
          id: randomUUID(),
          label: `${path.basename(selectedPath)}/`,
          kind: 'folder',
          path: selectedPath,
        })
        this.appendLog('Context', `Added folder: ${selectedPath}`)
        await this.commit()
      }

      return this.getSnapshot()
    })
  }

  async exportState(destination: string) {
    return this.enqueueMutation(async () => {
      await writeFile(destination, JSON.stringify(this.getSnapshot(), null, 2), 'utf8')
      this.appendLog('Share', `Exported task snapshot to ${destination}`)
      await this.commit()
      return this.getSnapshot()
    })
  }

  getArtifactPath(artifactId: string) {
    const artifact = this.state.snapshot.timeline.find(
      item => item.kind === 'artifact' && item.id === artifactId,
    )

    return artifact?.kind === 'artifact' ? artifact.artifactPath : undefined
  }

  async dispose() {
    this.disposed = true
    this.stopTimer()
    await this.mutationQueue
    await this.writeQueue
    this.listeners.clear()
  }

  private startTimer() {
    if (this.disposed || this.timer || this.state.snapshot.taskStatus !== 'running') {
      return
    }

    this.timer = setInterval(() => {
      if (this.tickInFlight) {
        return
      }

      this.tickInFlight = true
      void this.enqueueMutation(() => this.tick()).finally(() => {
        this.tickInFlight = false
      })
    }, this.tickMs)
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async tick() {
    if (this.state.snapshot.taskStatus !== 'running') {
      this.stopTimer()
      return
    }

    this.refreshElapsed()
    this.state.snapshot.progress = Math.min(100, this.state.snapshot.progress + 2)

    while (
      this.state.runtime.phaseIndex < phaseProgress.length
      && this.state.snapshot.progress >= phaseProgress[this.state.runtime.phaseIndex]
    ) {
      await this.completePhase(this.state.runtime.phaseIndex)
      this.state.runtime.phaseIndex += 1
    }

    if (this.state.snapshot.progress >= 100) {
      this.state.snapshot.taskStatus = 'complete'
      this.state.runtime.lastResumedAt = null
      this.setTools(false, 'Complete')
      this.appendLog('Task Engine', 'Task completed successfully')
      this.stopTimer()
      await this.refreshArtifact()
    }

    await this.commit()
  }

  private async completePhase(index: number) {
    this.state.snapshot.steps = this.state.snapshot.steps.map((step, stepIndex) => ({
      ...step,
      state: stepIndex <= index ? 'done' : stepIndex === index + 1 ? 'current' : 'todo',
    }))
    this.syncChecklist()

    const now = new Date()
    const events: Array<Omit<TimelineTool, 'id' | 'time'>> = [
      { kind: 'tool', tool: 'Task Engine', text: 'Requirements analyzed and execution plan created', accent: 'purple' },
      { kind: 'tool', tool: 'Research', text: 'Context and relevant local resources reviewed', accent: 'green' },
      { kind: 'tool', tool: 'Task Engine', text: 'Core task execution completed', accent: 'blue' },
      { kind: 'tool', tool: 'File System', text: 'Result artifact and metadata created', accent: 'amber' },
      { kind: 'tool', tool: 'Validator', text: 'Result validated successfully', accent: 'green' },
    ]

    if (index === 3) {
      const artifactDirectory = path.join(this.artifactRoot, this.state.snapshot.taskId)
      const artifactPath = path.join(artifactDirectory, 'task-result.json')
      await mkdir(artifactDirectory, { recursive: true })
      await this.writeArtifact(artifactPath, now)
      this.state.snapshot.timeline.push({
        id: randomUUID(),
        kind: 'artifact',
        tool: 'File System',
        time: timeLabel(now),
        text: 'Created persisted task result',
        artifactLabel: 'task-result.json',
        artifactPath,
        accent: 'amber',
      })
      this.appendLog('File System', `Created artifact: ${artifactPath}`)
      return
    }

    const event = events[index]
    this.state.snapshot.timeline.push({ ...event, id: randomUUID(), time: timeLabel(now) })
    this.appendLog(event.tool, event.text)
  }

  private refreshElapsed() {
    const resumedAt = this.state.runtime.lastResumedAt

    if (resumedAt !== null && this.state.snapshot.taskStatus === 'running') {
      const delta = Math.max(0, Math.floor((Date.now() - resumedAt) / 1_000))

      if (delta > 0) {
        this.state.runtime.elapsedSeconds += delta
        this.state.runtime.lastResumedAt = resumedAt + delta * 1_000
      }
    }

    this.state.snapshot.elapsed = durationLabel(this.state.runtime.elapsedSeconds)
  }

  private setTools(active: boolean, detail: string) {
    this.state.snapshot.tools = this.state.snapshot.tools.map(tool => ({
      ...tool,
      state: active ? 'active' : 'idle',
      detail,
    }))
  }

  private appendLog(source: string, message: string) {
    this.state.snapshot.logs.push({
      id: randomUUID(),
      time: logTime(),
      source,
      message,
    })
    this.state.snapshot.logs = this.state.snapshot.logs.slice(-2_000)
  }

  private syncChecklist() {
    this.state.snapshot.timeline = this.state.snapshot.timeline.map(item => (
      item.kind === 'summary' ? { ...item, checklist: structuredClone(this.state.snapshot.steps) } : item
    ))
  }

  private async refreshArtifact() {
    const artifact = this.state.snapshot.timeline.find(item => item.kind === 'artifact')

    if (artifact?.kind === 'artifact' && artifact.artifactPath) {
      await this.writeArtifact(artifact.artifactPath, new Date())
    }
  }

  private async writeArtifact(artifactPath: string, generatedAt: Date) {
    await writeFile(artifactPath, JSON.stringify({
      taskId: this.state.snapshot.taskId,
      title: this.state.snapshot.taskTitle,
      status: this.state.snapshot.taskStatus,
      progress: this.state.snapshot.progress,
      steps: this.state.snapshot.steps,
      context: this.state.snapshot.contextItems,
      generatedAt: generatedAt.toISOString(),
    }, null, 2), 'utf8')
  }

  private enqueueMutation<T>(operation: () => Promise<T> | T) {
    if (this.disposed) {
      return Promise.reject(new Error('Task backend is shutting down'))
    }

    const result = this.mutationQueue.then(operation)
    this.mutationQueue = result.then(() => undefined, () => undefined)
    return result
  }

  private async commit() {
    this.state.snapshot.revision += 1
    await this.persist()
    const snapshot = this.getSnapshot()
    this.listeners.forEach(listener => listener(snapshot))
  }

  private async persist() {
    const payload = JSON.stringify(this.state, null, 2)
    const temporaryPath = `${this.statePath}.tmp`

    const write = this.writeQueue.then(async () => {
      await writeFile(temporaryPath, payload, 'utf8')
      await rename(temporaryPath, this.statePath)
    })
    this.writeQueue = write.then(() => undefined, () => undefined)

    await write
  }
}
