import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

if (window.desktop?.isDesktop) {
  document.documentElement.dataset.runtime = 'desktop'
  document.documentElement.dataset.platform = window.desktop.platform
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
