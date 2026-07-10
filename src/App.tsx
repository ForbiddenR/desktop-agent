import { AppShell } from './components/shell/AppShell'
import { useAgentStudio } from './hooks/useAgentStudio'

export default function App() {
  const { data, actions, isBusy, error } = useAgentStudio()

  return <AppShell data={data} actions={actions} isBusy={isBusy} error={error} />
}
