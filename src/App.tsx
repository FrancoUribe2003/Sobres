import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { RecoverPage } from '@/features/auth/RecoverPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { OnboardingPage } from '@/features/auth/OnboardingPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/HomePage'
import { MovementsPage } from '@/features/expenses/MovementsPage'
import { FixedExpensesPage } from '@/features/fixed/FixedExpensesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public-only routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/recuperar" element={<RecoverPage />} />
            </Route>

            {/* Password reset route */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Onboarding route */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/movimientos" element={<MovementsPage />} />
                <Route path="/fijos" element={<FixedExpensesPage />} />
                <Route path="/ajustes" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
