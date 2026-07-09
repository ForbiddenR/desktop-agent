import { AppShell } from './components/shell/AppShell'
import { agentStudioData } from './data/agentStudioMock'

export default function App() {
  return <AppShell data={agentStudioData} />
}
