import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router'
import { ProtectedRoute } from '../ProtectedRoute'
import { PublicOnlyRoute } from '../PublicOnlyRoute'
import * as useAuthModule from '../useAuth'
import * as useProfileModule from '../useProfile'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '../useProfile'

vi.mock('../useAuth')
vi.mock('../useProfile')

const mockSession: Session = {
  access_token: 'fake-token',
  refresh_token: 'fake-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01',
  } as User,
}

const mockCompleteProfile: Profile = {
  id: 'user-123',
  created_at: '2026-01-01',
  display_name: 'Usuario Test',
  display_currency: 'ARS',
  preferred_rate: 'blue',
  work_mode: 'full_time',
  weekly_hours: 40,
  hourly_rate: null,
  monthly_income: 500000,
  income_currency: 'ARS',
}

const mockIncompleteProfile: Profile = {
  id: 'user-123',
  created_at: '2026-01-01',
  display_name: 'Usuario Nuevo',
  display_currency: 'ARS',
  preferred_rate: 'blue',
  work_mode: null,
  weekly_hours: null,
  hourly_rate: null,
  monthly_income: null,
  income_currency: 'ARS',
}

describe('Route guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProtectedRoute', () => {
    it('shows loading state while auth is loading', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: true,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: null,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Contenido Protegido</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
    })

    it('redirects to /login when there is no active session', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: null,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<div>Pantalla Login</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Contenido Protegido</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Pantalla Login')).toBeInTheDocument()
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
    })

    it('redirects to /onboarding when session exists but onboarding is not completed', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: mockSession.user,
        session: mockSession,
        loading: false,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: mockIncompleteProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/onboarding" element={<div>Pantalla Onboarding</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Contenido Protegido</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Pantalla Onboarding')).toBeInTheDocument()
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument()
    })

    it('renders protected content when session exists and onboarding is complete', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: mockSession.user,
        session: mockSession,
        loading: false,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: mockCompleteProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Contenido Protegido</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument()
    })
  })

  describe('PublicOnlyRoute', () => {
    it('renders public content when there is no active session', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: null,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>Pantalla Login</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Pantalla Login')).toBeInTheDocument()
    })

    it('redirects to /onboarding when session exists but onboarding is not completed', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: mockSession.user,
        session: mockSession,
        loading: false,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: mockIncompleteProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/onboarding" element={<div>Pantalla Onboarding</div>} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>Pantalla Login</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Pantalla Onboarding')).toBeInTheDocument()
      expect(screen.queryByText('Pantalla Login')).not.toBeInTheDocument()
    })

    it('redirects to / when session exists and onboarding is complete', () => {
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        user: mockSession.user,
        session: mockSession,
        loading: false,
      })
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        profile: mockCompleteProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        refetch: vi.fn(),
      })

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/" element={<div>Inicio</div>} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<div>Pantalla Login</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.queryByText('Pantalla Login')).not.toBeInTheDocument()
    })
  })
})
