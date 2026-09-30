import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'

interface ProtectedRouteProps {
  children?: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile()

  if (authLoading || (session && profileLoading)) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.work_mode == null) {
    return <Navigate to="/onboarding" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
