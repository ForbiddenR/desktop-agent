import { ChevronDown, Command, X } from 'lucide-react'
import { NavIcon } from '../ui/NavIcon'
import type { DashboardData, NavItem } from '../../types/dashboard'

type SidebarProps = {
  data: DashboardData
  isOpen: boolean
  onClose: () => void
}

function NavRow({ item }: { item: NavItem }) {
  return (
    <button
      className={`sidebar-nav__item ${item.selected ? 'is-selected' : ''}`.trim()}
      type="button"
      aria-current={item.selected ? 'page' : undefined}
    >
      <NavIcon name={item.icon} />
      <span>{item.label}</span>
      {item.badge ? <span className="sidebar-nav__badge">{item.badge}</span> : null}
    </button>
  )
}

export function Sidebar({ data, isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`.trim()} aria-label="Primary navigation">
      <div className="sidebar__header">
        <div className="window-controls" aria-hidden="true">
          <span className="window-control window-control--red" />
          <span className="window-control window-control--yellow" />
          <span className="window-control window-control--green" />
        </div>
        <div className="brand-mark">
          <Command size={16} strokeWidth={2.4} />
        </div>
        <strong>{data.projectName}</strong>
        <button
          className="icon-button sidebar__close"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <button className="new-task-button" type="button">
        <NavIcon name="plus" />
        <span>New Task</span>
        <kbd>⌘K</kbd>
      </button>

      <nav className="sidebar-nav" aria-label="Workspace navigation">
        <NavRow item={data.nav[0]} />
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-section__label">
          <span>Workspace</span>
          <ChevronDown size={14} />
        </div>
        <nav className="sidebar-nav" aria-label="Workspace sections">
          {data.nav.slice(1).map(item => (
            <NavRow item={item} key={item.id} />
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section__label">Agents</div>
        <nav className="sidebar-nav" aria-label="Agents">
          {data.agents.map(agent => (
            <button
              className={`sidebar-nav__item ${agent.selected ? 'is-selected' : ''}`.trim()}
              key={agent.id}
              type="button"
              aria-current={agent.selected ? 'page' : undefined}
            >
              <NavIcon name={agent.icon} />
              <span>{agent.name}</span>
            </button>
          ))}
          <button className="sidebar-nav__item sidebar-nav__item--muted" type="button">
            <NavIcon name="plus" />
            <span>New Agent</span>
          </button>
        </nav>
      </div>

      <nav className="sidebar-nav sidebar-nav--secondary" aria-label="Secondary navigation">
        {data.secondaryNav.map(item => (
          <NavRow item={item} key={item.id} />
        ))}
      </nav>

      <button className="user-profile" type="button" aria-label={`Signed in as ${data.user.name}`}>
        <span className="user-profile__avatar">{data.user.initials}</span>
        <span className="user-profile__copy">
          <strong>{data.user.name}</strong>
          <span>{data.user.email}</span>
        </span>
        <ChevronDown size={15} />
      </button>
    </aside>
  )
}
