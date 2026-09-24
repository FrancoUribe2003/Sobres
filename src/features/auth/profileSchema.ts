import { z } from 'zod'

const optionalPositiveMoney = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null
    const num = typeof val === 'number' ? val : Number(val)
    return isNaN(num) ? NaN : num
  })
  .refine(
    (val) => val === null || (!isNaN(val) && val > 0),
    { message: 'El monto debe ser mayor a 0' }
  )
  .refine(
    (val) => {
      if (val === null || isNaN(val)) return true
      return Math.round(val * 100) === val * 100
    },
    { message: 'El monto puede tener como máximo 2 decimales' }
  )

const optionalWeeklyHours = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null
    const num = typeof val === 'number' ? val : Number(val)
    return isNaN(num) ? NaN : num
  })
  .refine(
    (val) => val === null || (!isNaN(val) && val > 0 && val <= 168),
    { message: 'Las horas semanales deben ser un número válido entre 1 y 168' }
  )

export const onboardingSchema = z.object({
  display_name: z.string().trim().max(100, 'El nombre no puede tener más de 100 caracteres').optional(),
  display_currency: z.enum(['ARS', 'USD'], {
    message: 'Seleccioná una moneda válida',
  }),
  work_mode: z.enum(['hourly', 'full_time', 'part_time'], {
    message: 'Seleccioná cómo cobrás',
  }),
  weekly_hours: optionalWeeklyHours,
  income_currency: z.enum(['ARS', 'USD'], {
    message: 'Seleccioná una moneda válida',
  }),
  hourly_rate: optionalPositiveMoney,
  monthly_income: optionalPositiveMoney,
})

export type OnboardingFormData = z.input<typeof onboardingSchema>
export type OnboardingParsedData = z.output<typeof onboardingSchema>
