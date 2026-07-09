import {
  BookOpenText,
  Bot,
  Cable,
  Cpu,
  History,
  Home,
  LayoutGrid,
  ListChecks,
  Palette,
  Plus,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import type { NavIconName } from '../../types/dashboard'

const iconMap = {
  home: Home,
  overview: LayoutGrid,
  knowledge: BookOpenText,
  orchestrator: Sparkles,
  analyst: Cpu,
  researcher: Search,
  generator: Palette,
  tasks: ListChecks,
  history: History,
  integrations: Cable,
  settings: Settings,
  plus: Plus,
} satisfies Record<NavIconName, typeof Home>

type NavIconProps = {
  name: NavIconName
  size?: number
}

export function NavIcon({ name, size = 18 }: NavIconProps) {
  const Icon = iconMap[name]
  return <Icon size={size} strokeWidth={2} />
}
