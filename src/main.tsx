import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AnnotationsProvider } from '@/components/wf/annotations'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light">
    <HashRouter>
      <TooltipProvider>
        <AnnotationsProvider>
          <App />
          <Toaster />
        </AnnotationsProvider>
      </TooltipProvider>
    </HashRouter>
    </ThemeProvider>
  </StrictMode>,
)
