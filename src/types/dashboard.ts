export type TaskStatus = 'running' | 'paused' | 'complete'
export type StepState = 'done' | 'current' | 'todo'
export type ToolState = 'active' | 'idle'
export type AccentColor = 'purple' | 'blue' | 'green' | 'amber' | 'slate'

export type NavIconName =
  | 'home'
  | 'overview'
  | 'knowledge'
  | 'orchestrator'
  | 'analyst'
  | 'researcher'
  | 'generator'
  | 'tasks'
  | 'history'
  | 'integrations'
  | 'settings'
  | 'plus'

export type NavItem = {
  id: string
  label: string
  icon: NavIconName
  selected?: boolean
  badge?: string | number
}

export type AgentItem = {
  id: string
  name: string
  icon: NavIconName
  selected?: boolean
}

export type UserProfile = {
  name: string
  email: string
  initials: string
}

export type StepItem = {
  id: string
  label: string
  state: StepState
}

export type ToolItem = {
  id: string
  name: string
  detail: string
  state: ToolState
  accent: AccentColor
}

export type ContextItem = {
  id: string
  label: string
  kind: 'docs' | 'folder' | 'file'
  path?: string
}

export type LogEntry = {
  id: string
  time: string
  source: string
  message: string
}

export type TimelineSummaryItem = {
  id: string
  kind: 'summary'
  actor: string
  time: string
  text: string
  checklist: StepItem[]
}

export type TimelineToolItem = {
  id: string
  kind: 'tool'
  tool: string
  time: string
  text: string
  meta?: string
  accent: AccentColor
}

export type TimelineCodeItem = {
  id: string
  kind: 'code'
  tool: string
  time: string
  file: string
  language: string
  lines: string[]
  accent: AccentColor
}

export type TimelineArtifactItem = {
  id: string
  kind: 'artifact'
  tool: string
  time: string
  text: string
  artifactLabel: string
  artifactPath?: string
  accent: AccentColor
}

export type TimelineItem =
  | TimelineSummaryItem
  | TimelineToolItem
  | TimelineCodeItem
  | TimelineArtifactItem

export type DashboardData = {
  revision?: number
  taskId?: string
  workspaceName: string
  projectName: string
  selectedAgent: string
  modelName: string
  taskTitle: string
  taskStatus: TaskStatus
  progress: number
  startedAt: string
  elapsed: string
  estimatedFinish: string
  nav: NavItem[]
  agents: AgentItem[]
  secondaryNav: NavItem[]
  user: UserProfile
  steps: StepItem[]
  tools: ToolItem[]
  contextItems: ContextItem[]
  timeline: TimelineItem[]
  logs: LogEntry[]
}

export type TaskSnapshot = Pick<
  DashboardData,
  | 'revision'
  | 'taskId'
  | 'taskTitle'
  | 'taskStatus'
  | 'progress'
  | 'startedAt'
  | 'elapsed'
  | 'estimatedFinish'
  | 'steps'
  | 'tools'
  | 'contextItems'
  | 'timeline'
  | 'logs'
>
