import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AnnotationsProvider } from '@/components/wf/annotations'
import { JourneyShell } from '@/journey/journey-shell'
import { PinLayer } from '@/annotations/pin-layer'
import './index.css'
import App from './App.tsx'

// Sem ?frame → casca de jornadas; com ?frame=1 → o protótipo (carregado no iframe da casca).
const isFrame = new URLSearchParams(location.search).has('frame')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        {isFrame ? (
          <HashRouter>
            <AnnotationsProvider>
              <App />
              <Toaster />
              {parent !== window && <PinLayer />}
            </AnnotationsProvider>
          </HashRouter>
        ) : (
          <>
            <JourneyShell />
            <Toaster />
          </>
        )}
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
