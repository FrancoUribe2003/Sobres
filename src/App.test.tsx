import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { App } from './App'
import * as useAuthModule from '@/features/auth/useAuth'
import * as useProfileModule from '@/features/auth/useProfile'
import type { Session, User } from '@supabase/supabase-js'

vi.mock('@/features/auth/useAuth')
vi.mock('@/features/auth/useProfile')

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

describe('App navigation smoke test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: mockSession.user,
      session: mockSession,
      loading: false,
    })
    vi.mocked(useProfileModule.useProfile).mockReturnValue({
      profile: {
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
      },
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      isUpdating: false,
      refetch: vi.fn(),
    })
  })

  it('renders the bottom navigation bar with all 4 tabs', async () => {
    render(<App />)

    expect(await screen.findByRole('link', { name: /inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /movimientos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /fijos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ajustes/i })).toBeInTheDocument()
  })

  it('renders the floating action button', async () => {
    render(<App />)

    expect(await screen.findByRole('button', { name: /nuevo registro/i })).toBeInTheDocument()
  })
})
