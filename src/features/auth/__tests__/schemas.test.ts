import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  registerSchema,
  recoverSchema,
  resetPasswordSchema,
} from '../schemas'
import { onboardingSchema } from '../profileSchema'

describe('Auth Zod schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email and non-empty password', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@ejemplo.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalido',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'usuario@ejemplo.com',
        password: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('accepts matching passwords of at least 8 characters', () => {
      const result = registerSchema.safeParse({
        email: 'usuario@ejemplo.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        email: 'usuario@ejemplo.com',
        password: '1234567',
        confirmPassword: '1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 caracteres')
      }
    })

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        email: 'usuario@ejemplo.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Las contraseñas no coinciden')
      }
    })
  })

  describe('recoverSchema', () => {
    it('validates email format', () => {
      expect(recoverSchema.safeParse({ email: 'test@example.com' }).success).toBe(true)
      expect(recoverSchema.safeParse({ email: 'no-email' }).success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('validates minimum 8 characters and confirmation match', () => {
      expect(
        resetPasswordSchema.safeParse({
          password: 'newpassword1',
          confirmPassword: 'newpassword1',
        }).success,
      ).toBe(true)

      expect(
        resetPasswordSchema.safeParse({
          password: 'short',
          confirmPassword: 'short',
        }).success,
      ).toBe(false)

      expect(
        resetPasswordSchema.safeParse({
          password: 'newpassword1',
          confirmPassword: 'mismatchpassword',
        }).success,
      ).toBe(false)
    })
  })

  describe('onboardingSchema', () => {
    it('requires work_mode', () => {
      const result = onboardingSchema.safeParse({
        display_name: 'Franco',
        display_currency: 'ARS',
        work_mode: undefined,
        weekly_hours: 40,
        income_currency: 'ARS',
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid full_time data with optional income left empty', () => {
      const result = onboardingSchema.safeParse({
        display_name: 'Franco',
        display_currency: 'ARS',
        work_mode: 'full_time',
        weekly_hours: 40,
        income_currency: 'ARS',
        hourly_rate: '',
        monthly_income: '',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.hourly_rate).toBeNull()
        expect(result.data.monthly_income).toBeNull()
      }
    })

    it('accepts valid amounts with up to 2 decimal places', () => {
      const result = onboardingSchema.safeParse({
        display_name: 'Franco',
        display_currency: 'ARS',
        work_mode: 'hourly',
        weekly_hours: 30,
        income_currency: 'USD',
        hourly_rate: '25.50',
        monthly_income: '',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.hourly_rate).toBe(25.5)
      }
    })

    it('rejects negative income amounts', () => {
      const result = onboardingSchema.safeParse({
        display_name: 'Franco',
        display_currency: 'ARS',
        work_mode: 'hourly',
        weekly_hours: 30,
        income_currency: 'USD',
        hourly_rate: '-10',
      })
      expect(result.success).toBe(false)
    })

    it('rejects income amounts with more than 2 decimal places', () => {
      const result = onboardingSchema.safeParse({
        display_name: 'Franco',
        display_currency: 'ARS',
        work_mode: 'hourly',
        weekly_hours: 30,
        income_currency: 'USD',
        hourly_rate: '15.999',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid weekly hours', () => {
      const result = onboardingSchema.safeParse({
        display_currency: 'ARS',
        work_mode: 'full_time',
        weekly_hours: 200,
        income_currency: 'ARS',
      })
      expect(result.success).toBe(false)
    })
  })
})
