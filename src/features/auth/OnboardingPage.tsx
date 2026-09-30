import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from './useAuth'
import { useProfile } from './useProfile'
import { onboardingSchema, type OnboardingFormData, type OnboardingParsedData } from './profileSchema'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading, updateProfile } = useProfile()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData, unknown, OnboardingParsedData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      display_name: '',
      display_currency: 'ARS',
      work_mode: 'full_time',
      weekly_hours: 40,
      income_currency: 'ARS',
      hourly_rate: '',
      monthly_income: '',
    },
  })

  const currentWorkMode = watch('work_mode')

  useEffect(() => {
    if (profile) {
      if (profile.display_name) setValue('display_name', profile.display_name)
      if (profile.display_currency) setValue('display_currency', profile.display_currency)
      if (profile.work_mode) setValue('work_mode', profile.work_mode)
      if (profile.weekly_hours != null) setValue('weekly_hours', profile.weekly_hours)
      if (profile.income_currency) setValue('income_currency', profile.income_currency)
      if (profile.hourly_rate != null) setValue('hourly_rate', profile.hourly_rate)
      if (profile.monthly_income != null) setValue('monthly_income', profile.monthly_income)
    }
  }, [profile, setValue])

  const handleWorkModeChange = (mode: 'hourly' | 'full_time' | 'part_time') => {
    setValue('work_mode', mode)
    if (mode === 'full_time') {
      setValue('weekly_hours', 40)
    } else if (mode === 'part_time') {
      setValue('weekly_hours', 20)
    }
  }

  const onSubmit = async (data: OnboardingParsedData) => {
    setErrorMessage(null)
    try {
      await updateProfile({
        display_name: data.display_name?.trim() || null,
        display_currency: data.display_currency,
        work_mode: data.work_mode,
        weekly_hours: data.weekly_hours ?? null,
        income_currency: data.income_currency,
        hourly_rate: data.work_mode === 'hourly' ? (data.hourly_rate ?? null) : null,
        monthly_income: data.work_mode !== 'hourly' ? (data.monthly_income ?? null) : null,
      })

      navigate('/')
    } catch {
      setErrorMessage('Ocurrió un error al guardar tu perfil. Por favor, intentá nuevamente.')
    }
  }

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

  if (profile?.work_mode != null) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">¡Te damos la bienvenida!</CardTitle>
          <CardDescription>
            Configurá tu perfil para adaptar los cálculos a tu forma de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {errorMessage}
              </div>
            )}

            {/* Nombre para mostrar */}
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Nombre para mostrar</Label>
              <Input
                id="display_name"
                placeholder="¿Cómo te gustaría que te llamemos?"
                disabled={isSubmitting}
                {...register('display_name')}
              />
              {errors.display_name && (
                <p className="text-xs text-destructive">{errors.display_name.message}</p>
              )}
            </div>

            {/* Moneda para totales */}
            <div className="space-y-1.5">
              <Label htmlFor="display_currency">Moneda para ver totales</Label>
              <Controller
                control={control}
                name="display_currency"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="display_currency">
                      <SelectValue placeholder="Seleccioná una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">Pesos argentinos (ARS)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.display_currency && (
                <p className="text-xs text-destructive">{errors.display_currency.message}</p>
              )}
            </div>

            {/* Cómo cobra */}
            <div className="space-y-2">
              <Label>¿Cómo cobrás?</Label>
              <Controller
                control={control}
                name="work_mode"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(val) =>
                      handleWorkModeChange(val as 'hourly' | 'full_time' | 'part_time')
                    }
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                    disabled={isSubmitting}
                  >
                    <label
                      htmlFor="wm-full"
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 text-sm transition-colors ${
                        field.value === 'full_time'
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="full_time" id="wm-full" />
                      <span>Tiempo completo</span>
                    </label>

                    <label
                      htmlFor="wm-part"
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 text-sm transition-colors ${
                        field.value === 'part_time'
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="part_time" id="wm-part" />
                      <span>Medio tiempo</span>
                    </label>

                    <label
                      htmlFor="wm-hourly"
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 text-sm transition-colors ${
                        field.value === 'hourly'
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="hourly" id="wm-hourly" />
                      <span>Por hora</span>
                    </label>
                  </RadioGroup>
                )}
              />
              {errors.work_mode && (
                <p className="text-xs text-destructive">{errors.work_mode.message}</p>
              )}
            </div>

            {/* Horas semanales */}
            <div className="space-y-1.5">
              <Label htmlFor="weekly_hours">Horas de trabajo semanales</Label>
              <Input
                id="weekly_hours"
                type="number"
                step="any"
                placeholder={currentWorkMode === 'part_time' ? '20' : '40'}
                disabled={isSubmitting}
                {...register('weekly_hours')}
              />
              {errors.weekly_hours && (
                <p className="text-xs text-destructive">{errors.weekly_hours.message}</p>
              )}
            </div>

            {/* Ingreso opcional */}
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="income-amount">
                  {currentWorkMode === 'hourly' ? 'Valor hora' : 'Ingreso mensual'}
                </Label>
                <span className="text-xs text-muted-foreground">Opcional</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Podés completarlo después en Ajustes si preferís.
              </p>

              <div className="flex gap-2">
                <div className="flex-1">
                  {currentWorkMode === 'hourly' ? (
                    <Input
                      id="income-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...register('hourly_rate')}
                    />
                  ) : (
                    <Input
                      id="income-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...register('monthly_income')}
                    />
                  )}
                </div>

                <div className="w-28">
                  <Controller
                    control={control}
                    name="income_currency"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">ARS</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {errors.hourly_rate && (
                <p className="text-xs text-destructive">{errors.hourly_rate.message}</p>
              )}
              {errors.monthly_income && (
                <p className="text-xs text-destructive">{errors.monthly_income.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Comenzar a usar la app'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
