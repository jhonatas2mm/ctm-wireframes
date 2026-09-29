import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layouts/app-shell'
import { screens } from '@/screens'
import NotFound from '@/pages/not-found'
import { BarreiraErro } from '@/components/wf/erro'

export default function App() {
  return (
    <Routes>
      <Route element={<BarreiraErro><AppShell /></BarreiraErro>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        {screens.map((s) => (
          <Route key={s.path} path={s.path} element={<s.component />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
