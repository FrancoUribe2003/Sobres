import { BrowserRouter, Routes, Route } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/HomePage'
import { MovementsPage } from '@/features/expenses/MovementsPage'
import { FixedExpensesPage } from '@/features/fixed/FixedExpensesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movimientos" element={<MovementsPage />} />
          <Route path="/fijos" element={<FixedExpensesPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
