import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router'
import { OnboardingPage } from '../OnboardingPage'
import * as useAuthModule from '../useAuth'
import * as useProfileModule from '../useProfile'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '../useProfile'

vi.mock('../useAuth')
vi.mock('../useProfile')

const mockUser: User = {
  id: 'user-456',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01',
} as User

const mockSession: Session = {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

const mockInitialProfile: Profile = {
  id: 'user-456',
  created_at: '2026-01-01',
  display_name: null,
  display_currency: 'ARS',
  preferred_rate: 'blue',
  work_mode: null,
  weekly_hours: null,
  hourly_rate: null,
  monthly_income: null,
  income_currency: 'ARS',
}

describe('OnboardingPage form flow', () => {
  const updateProfileMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: mockUser,
      session: mockSession,
      loading: false,
    })
    vi.mocked(useProfileModule.useProfile).mockReturnValue({
      profile: mockInitialProfile,
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: updateProfileMock,
      isUpdating: false,
      refetch: vi.fn(),
    })
  })

  it('renders all onboarding form fields', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <OnboardingPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('¡Te damos la bienvenida!')).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre para mostrar/i)).toBeInTheDocument()
    expect(screen.getByText(/¿cómo cobrás\?/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/horas de trabajo semanales/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /comenzar a usar la app/i })).toBeInTheDocument()
  })

  it('submits updated profile data without user_id and redirects to /', async () => {
    const user = userEvent.setup()
    updateProfileMock.mockResolvedValueOnce({
      ...mockInitialProfile,
      work_mode: 'hourly',
    })

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<div>Pantalla Principal</div>} />
        </Routes>
      </MemoryRouter>,
    )

    const nameInput = screen.getByLabelText(/nombre para mostrar/i)
    await user.type(nameInput, 'Franco Test')

    // Click "Por hora"
    const hourlyOption = screen.getByLabelText(/por hora/i)
    await user.click(hourlyOption)

    // Fill hourly rate
    const rateInput = screen.getByLabelText(/valor hora/i)
    await user.type(rateInput, '3500.50')

    const submitBtn = screen.getByRole('button', { name: /comenzar a usar la app/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledTimes(1)
    })

    // Verify updateProfile call payload has no user_id property
    const calledPayload = updateProfileMock.mock.calls[0][0]
    expect(calledPayload).not.toHaveProperty('user_id')
    expect(calledPayload).toMatchObject({
      display_name: 'Franco Test',
      work_mode: 'hourly',
      hourly_rate: 3500.5,
      monthly_income: null,
    })

    expect(await screen.findByText('Pantalla Principal')).toBeInTheDocument()
  })
})
