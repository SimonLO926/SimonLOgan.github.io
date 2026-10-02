import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrefsProvider } from './i18n'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <App />
    </PrefsProvider>
  </StrictMode>,
)
