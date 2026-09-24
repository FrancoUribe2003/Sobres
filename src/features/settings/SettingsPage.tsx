import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { useProfile } from '@/features/auth/useProfile'
import {
  onboardingSchema,
  type OnboardingFormData,
  type OnboardingParsedData,
} from '@/features/auth/profileSchema'

export function SettingsPage() {
  const navigate = useNavigate()
  const { profile, isLoading, updateProfile } = useProfile()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Delete account state
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
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
      reset({
        display_name: profile.display_name ?? '',
        display_currency: profile.display_currency ?? 'ARS',
        work_mode: profile.work_mode ?? 'full_time',
        weekly_hours: profile.weekly_hours ?? 40,
        income_currency: profile.income_currency ?? 'ARS',
        hourly_rate: profile.hourly_rate ?? '',
        monthly_income: profile.monthly_income ?? '',
      })
    }
  }, [profile, reset])

  const handleWorkModeChange = (mode: 'hourly' | 'full_time' | 'part_time') => {
    setValue('work_mode', mode)
    if (mode === 'full_time') {
      setValue('weekly_hours', 40)
    } else if (mode === 'part_time') {
      setValue('weekly_hours', 20)
    }
  }

  const onSubmit = async (data: OnboardingParsedData) => {
    setSaveSuccess(false)
    setSaveError(null)

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

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('No pudimos guardar los cambios. Por favor, intentá nuevamente.')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'ELIMINAR') return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const { error } = await supabase.functions.invoke('delete-account')

      if (error) {
        setDeleteError('No pudimos eliminar tu cuenta. Por favor, intentá nuevamente.')
        setIsDeleting(false)
        return
      }

      await supabase.auth.signOut()
      queryClient.clear()
      navigate('/login')
    } catch {
      setDeleteError('No pudimos eliminar tu cuenta. Por favor, intentá nuevamente.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Modificá tus datos de perfil, preferencias e ingreso
        </p>
      </div>

      {/* Formulario de perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfil y trabajo</CardTitle>
          <CardDescription>
            Personalizá tus datos para que los cálculos de saldo y horas sean exactos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {saveSuccess && (
              <div
                role="status"
                className="rounded-lg bg-primary/10 p-3 text-sm text-primary"
              >
                Cambios guardados con éxito.
              </div>
            )}
            {saveError && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {saveError}
              </div>
            )}

            {/* Nombre para mostrar */}
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Nombre para mostrar</Label>
              <Input
                id="display_name"
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
                      htmlFor="settings-wm-full"
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 text-sm transition-colors ${
                        field.value === 'full_time'
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="full_time" id="settings-wm-full" />
                      <span>Tiempo completo</span>
                    </label>

                    <label
                      htmlFor="settings-wm-part"
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 text-sm transition-colors ${
                        field.value === 'part_time'
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="part_time" id="settings-wm-part" />
                      <span>Medio tiempo</span>
                    </label>

                    <label
                      htmlFor="settings-wm-hourly"
                      className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 text-sm transition-colors ${
                        field.value === 'hourly'
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      <RadioGroupItem value="hourly" id="settings-wm-hourly" />
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
                disabled={isSubmitting}
                {...register('weekly_hours')}
              />
              {errors.weekly_hours && (
                <p className="text-xs text-destructive">{errors.weekly_hours.message}</p>
              )}
            </div>

            {/* Ingreso */}
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <Label htmlFor="income-amount">
                {currentWorkMode === 'hourly' ? 'Valor hora' : 'Ingreso mensual'}
              </Label>

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
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sesión */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sesión</CardTitle>
          <CardDescription>Gestioná tu sesión actual en este dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full text-foreground hover:bg-accent"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>

      {/* Zona de peligro - Eliminar cuenta */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Zona de peligro</CardTitle>
          <CardDescription>
            La eliminación de la cuenta es permanente y borrará todos tus ingresos, gastos y categorías.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>¿Estás seguro de que querés eliminar tu cuenta?</DialogTitle>
                <DialogDescription className="space-y-2 pt-2 text-left">
                  <span>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente tu perfil y todos tus datos financieros asociados.
                  </span>
                  <span className="block pt-2 font-medium text-foreground">
                    Para confirmar, escribí <span className="font-bold text-destructive">ELIMINAR</span> a continuación:
                  </span>
                </DialogDescription>
              </DialogHeader>

              {deleteError && (
                <div
                  role="alert"
                  className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive"
                >
                  {deleteError}
                </div>
              )}

              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Escribí ELIMINAR"
                autoComplete="off"
                disabled={isDeleting}
              />

              <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setDeleteConfirmationText('')
                    setDeleteError(null)
                  }}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteConfirmationText !== 'ELIMINAR' || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? 'Eliminando cuenta...' : 'Eliminar mi cuenta'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </section>
  )
}
