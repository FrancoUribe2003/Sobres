# Gestor de sueldo (PWA) — Plan del proyecto

## 1. Qué es

App web instalable (PWA) para cualquier persona en Argentina que quiera saber cuánto gana, en qué gasta y cuánto puede gastar sin pasarse. Carga manual, ingresos y gastos en ARS o USD, conversión con el dólar que elija el usuario.

**Decisiones tomadas**
- PWA, no app nativa (sin stores, sin costo, sin problemas con iOS).
- Solo Argentina por ahora. Dólar por defecto: blue. El usuario puede elegir otro.
- Carga 100% manual. Sin integración bancaria.
- Auth desde el día 1 (para poder sumar gastos compartidos después).
- Cada monto se guarda en su moneda original; la conversión se calcula al mostrar.
- Los ingresos futuros no cuentan en el saldo hasta que el usuario confirma que los recibió.

**Fuera del MVP (v2):** gastos compartidos y convivencia, push notifications, metas de ahorro, calculadora de importaciones, cuentas/billeteras múltiples, escritura offline, exportar CSV.

## 2. Stack

| Capa | Herramienta |
|---|---|
| Frontend | Vite + React + TypeScript |
| UI | Tailwind + shadcn/ui, mobile-first |
| PWA | vite-plugin-pwa |
| Estado servidor | TanStack Query |
| Formularios | React Hook Form + Zod |
| Routing | React Router |
| Backend | Supabase (Auth, Postgres + RLS, Edge Functions, pg_cron) |
| Tests | Vitest (solo lógica de dinero) |
| Hosting | Cloudflare Pages o Vercel |
| Landing (al final) | Astro |

## 3. Reglas transversales (valen para todas las fases)

- **Dinero:** columnas `numeric(14,2)`. Nunca floats para plata. Toda la lógica de conversión y totales vive en `src/lib/money.ts`, con tests.
- **Moneda:** `currency` es `'ARS'` o `'USD'`. Valor del dólar = promedio de compra y venta del tipo elegido.
- **Fechas:** los días de ingresos, gastos y vencimientos son tipo `date` (sin hora). Zona horaria de referencia: America/Argentina/Buenos_Aires.
- **Formato:** `Intl.NumberFormat('es-AR')` para montos y fechas.
- **Seguridad:** RLS activada en todas las tablas de usuario con `user_id = auth.uid()`. Nada de lógica de permisos en el frontend.
- **Períodos:** por ahora el "mes" es mes calendario.
- **Estructura de carpetas sugerida:** `src/features/{auth,incomes,expenses,categories,fixed,home,calculator,settings}`, `src/lib`, `src/components/ui`.
- **Tamaño:** S = un par de días, M = una semana, L = más de una semana.

## 4. Fases

### Fase 0 — Base del proyecto (S)

**Objetivo:** tener una app vacía, instalable y desplegada.

**Funcionalidades**
- Repo con Vite + React + TS, Tailwind, shadcn/ui, ESLint y Prettier.
- Proyecto Supabase creado, variables de entorno configuradas, cliente `supabase-js`.
- `vite-plugin-pwa` con manifest (nombre, íconos placeholder, `display: standalone`, color de tema).
- Layout base mobile-first: barra inferior con 4 pestañas (Inicio, Movimientos, Fijos, Ajustes) y botón flotante "+".
- Router con rutas vacías para cada sección.
- Deploy automático desde `main` y HTTPS.

**Listo cuando:** abrís la URL en el celular, la instalás en la pantalla de inicio y navegás entre las pestañas vacías.

### Fase 1 — Auth, perfil y modelo de datos (M)

**Objetivo:** usuarios que se registran y un esquema completo con RLS.

**Funcionalidades**
- Registro e inicio de sesión con email + contraseña y con Google.
- Recuperación de contraseña.
- Rutas protegidas: sin sesión, redirige al login.
- Al crear usuario, se crea su fila en `profiles` (trigger en la base).
- Onboarding corto (una pantalla): nombre, moneda para ver totales (ARS por defecto), cómo cobra (por hora, tiempo completo o medio tiempo) y cuánto gana.
- Eliminar cuenta y todos sus datos desde Ajustes.

**Tablas** (todas con `id`, `user_id`, `created_at` salvo `exchange_rates`)
- `profiles`: `display_name`, `display_currency`, `preferred_rate`, `work_mode` (`hourly` | `full_time` | `part_time`), `weekly_hours`, `hourly_rate`, `monthly_income`, `income_currency`.
- `exchange_rates`: `type` (PK), `buy`, `sell`, `source`, `updated_at`.
- `categories`: `name`, `icon`, `color`, `monthly_limit` (nullable), `limit_currency`, `archived`.
- `incomes`: `description`, `amount`, `currency`, `date`, `status` (`received` | `expected` | `not_received`), `recurring_income_id` (nullable), `period` (nullable).
- `recurring_incomes`: `description`, `amount`, `currency`, `day_of_month`, `active`.
- `expenses`: `category_id`, `description`, `amount`, `currency`, `date`, `fixed_expense_id` (nullable), `period` (nullable).
- `fixed_expenses`: `name`, `amount`, `currency`, `category_id`, `day_of_month`, `active`, `is_subscription`, `trial_ends_on` (nullable).
- Índices únicos en `(recurring_income_id, period)` y `(fixed_expense_id, period)` para no duplicar el mismo mes.

**Listo cuando:** un usuario nuevo se registra, completa el onboarding y otro usuario no puede leer ni escribir sus datos (probar con dos cuentas).

### Fase 2 — Cotizaciones del dólar (M)

**Objetivo:** tener cotizaciones actualizadas y que el usuario elija cuál usar.

**Funcionalidades**
- Edge Function `refresh-rates`: consulta DolarApi.com (ver su documentación para el endpoint), guarda blue, oficial, MEP, CCL, tarjeta y cripto en `exchange_rates`. Si falla, prueba Bluelytics (`https://api.bluelytics.com.ar/v2/latest`, solo oficial y blue). Si ambas fallan, no toca la tabla.
- `pg_cron` que llama a la función cada 30 a 60 minutos.
- Política RLS: cualquier usuario autenticado puede leer `exchange_rates`; solo el service role escribe.
- Hook `useRate()` que devuelve el valor (promedio compra/venta) del tipo elegido por el usuario.
- Selector de dólar en Ajustes (blue, oficial, MEP, CCL, cripto, tarjeta) con el valor actual de cada uno visible.
- Indicador "Cotización actualizada hace X" y aviso discreto si tiene más de unas horas.
- Función `convert(amount, from, to, rate)` en `money.ts`, con tests: USD→ARS, ARS→USD, misma moneda, redondeo.

**Listo cuando:** cambiar el dólar en Ajustes cambia el valor mostrado sin recargar, y si se apaga la API la app sigue mostrando el último valor guardado.

### Fase 3 — Ingresos (L)

**Objetivo:** cargar ingresos de todas las formas que pidió el usuario.

**Funcionalidades**
- **Ingreso puntual:** monto, moneda (ARS/USD), fecha, descripción. Se puede cargar en cualquier momento.
- **Ingreso futuro:** mismo formulario con un interruptor "Todavía no lo cobré" y fecha estimada. Se guarda con `status = 'expected'` y siempre se muestra con una etiqueta visible ("Esperado").
- **Ingreso recurrente** (ej. sueldo mensual): se define una vez con día del mes. Se calcula en el cliente cuál toca cada mes, sin duplicar filas.
- **Banner de confirmación:** al abrir la app, por cada ingreso esperado con fecha vencida (o el día siguiente) aparece "¿Recibiste $X del 15/10?" con tres acciones: Sí (pasa a `received`), No todavía (reprograma la fecha) y No llegó (`not_received`).
- Confirmar un recurrente crea la fila en `incomes` con su `period`, de modo que no se duplica.
- Lista de ingresos con filtro por mes, editar y borrar.
- Los esperados se listan aparte y nunca suman al saldo.

**Listo cuando:** cargás un ingreso futuro, cambiás la fecha a ayer, abrís la app y aparece el banner; al confirmar, el saldo sube.

### Fase 4 — Gastos, categorías y límites (L)

**Objetivo:** registrar gastos rápido y avisar cuando el usuario se pasa.

**Funcionalidades**
- **Categorías propias:** crear, editar, archivar. Nombre, ícono y color. Se crean con un conjunto inicial sugerido (Comida, Transporte, Salidas, Servicios, Salud) que el usuario puede borrar.
- **Alta de gasto en pocos toques:** monto, moneda, categoría, fecha (hoy por defecto), nota opcional. Teclado numérico y foco automático en el monto.
- **Límite mensual por categoría (opcional):** monto y moneda del límite. El gasto del mes en la categoría se convierte a la moneda del límite con el dólar elegido.
- **Estados por límite:** verde (menos del 70%), amarillo (70% al 100%), rojo (más del 100%). Los umbrales son constantes fáciles de cambiar.
- Pantalla de categorías con barra de progreso y estado.
- Aviso visual (toast) al cargar un gasto que hace pasar el límite.
- Lista de movimientos (gastos e ingresos juntos) con filtro por mes y por categoría, editar y borrar.

**Listo cuando:** ponés un límite de $50.000 a "Salidas", cargás gastos hasta pasarlo y la categoría se marca en rojo con el aviso al cargar el gasto que lo pasó.

### Fase 5 — Gastos fijos (M)

**Objetivo:** que los gastos que se repiten cada mes estén siempre a la vista.

**Funcionalidades**
- Alta de gasto fijo: nombre, monto, moneda, categoría, día del mes de vencimiento.
- Casilla "Es una suscripción" y, opcional, "Prueba gratis hasta" (`trial_ends_on`): un banner avisa unos días antes de que termine la prueba para que el usuario cancele a tiempo.
- Pantalla "Fijos": lista del mes con estado (Pendiente, Pagado, Vence pronto).
- Botón "Marcar como pagado": crea el gasto real con `fixed_expense_id` y `period`, ya en la categoría correspondiente.
- Total de fijos del mes y cuánto falta pagar.
- Pausar o borrar un fijo sin perder el historial de pagos.
- Los fijos pendientes del mes se restan del saldo disponible (ver Fase 6).

**Listo cuando:** cargás el alquiler para el día 5, ves "Pendiente", lo marcás como pagado y aparece como gasto en Movimientos y en su categoría.

### Fase 6 — Pantalla de inicio (M)

**Objetivo:** responder rápido "¿con cuánto cuento?".

**Cálculos** (todos con la moneda de visualización y el dólar elegido)
- **Saldo:** todos los ingresos recibidos menos todos los gastos.
- **Disponible:** saldo menos los fijos pendientes del mes.
- **Gastado este mes:** gastos del mes calendario, incluidos los fijos pagados.
- **Esperado:** ingresos futuros pendientes, mostrados aparte.
- **Por día:** disponible dividido los días que quedan del mes.

**Funcionalidades**
- Tarjeta principal: "Contás con $X" y "Gastaste $Y este mes".
- Desglose por moneda: cuánto hay en pesos y cuánto en dólares, con el total convertido.
- Sección "Esperado": ingresos futuros con fecha, siempre diferenciados.
- Próximos vencimientos (fijos de los próximos 7 días).
- Categorías en rojo o amarillo, si hay.
- Banners pendientes (confirmar ingresos, fin de prueba gratis).
- Estado vacío con guía para usuarios nuevos ("Cargá tu primer ingreso").

**Listo cuando:** los números coinciden con un cálculo hecho a mano con datos de prueba, y hay tests de Vitest para cada fórmula.

### Fase 7 — Calculadora de horas de trabajo (S)

**Objetivo:** traducir un precio a horas de trabajo.

**Funcionalidades**
- Valor hora: si cobra por hora, es directo. Si es tiempo completo o medio, se calcula con ingreso mensual y horas semanales (por defecto 40 y 20, editables): `monthly_income / (weekly_hours × 4,33)`.
- Pantalla con un campo de precio y selector de moneda; muestra "Te cuesta X horas (Y días de trabajo)".
- Convierte con el dólar elegido cuando el precio y el ingreso están en monedas distintas.
- Acceso rápido desde el formulario de gasto ("¿Cuánto me cuesta en horas?").
- Si el perfil no tiene ingreso cargado, la calculadora pide completarlo.

**Listo cuando:** un producto de US$100 con ingreso de $1.000.000 al mes y 40 horas semanales da un resultado que coincide con el cálculo manual, con el dólar elegido.

### Fase 8 — Pulido PWA (M)

**Objetivo:** que se sienta como una app de verdad.

**Funcionalidades**
- Íconos definitivos (192, 512 y maskable), splash y color de barra.
- Caché offline del shell de la app: abre sin conexión y muestra los últimos datos cargados (solo lectura).
- Botón de instalación en Android/Chrome.
- Mini tutorial para iOS ("Compartir → Agregar a inicio").
- Estados de carga, error y vacío en todas las pantallas.
- Revisión de accesibilidad básica (contraste, tamaños táctiles) y modo oscuro.
- Auditoría con Lighthouse (PWA, rendimiento).

**Listo cuando:** Lighthouse marca la app como instalable y funciona en un iPhone y en un Android reales.

### Fase 9 — Beta y lanzamiento (M)

**Objetivo:** que la use gente real.

**Funcionalidades**
- Prueba con 5 a 10 personas durante dos semanas y lista de problemas que encuentren.
- Botón de feedback dentro de la app (link a formulario).
- Corrección de lo que se trabe en el flujo de carga.
- Revisar límites del plan gratis de Supabase antes de abrir al público.
- Política de privacidad simple (qué datos se guardan y cómo se eliminan).
- Landing en Astro con capturas y explicación de cómo instalar.
- Repositorio y README prolijos (sirve para el CV).

**Listo cuando:** al menos 5 personas ajenas a vos la usaron durante dos semanas sin ayuda.

## 5. Riesgos

- **APIs de dólar caídas:** se mitiga guardando siempre el último valor y con una segunda fuente.
- **Plan gratis de Supabase:** puede pausar proyectos inactivos y tiene límites; verificar antes de la beta.
- **iOS con PWA:** sin push fuera de la app instalada y con instalación manual. Por eso el MVP no depende de push.
- **Errores en los cálculos de plata:** por eso los tests en `money.ts`.
- **Alcance:** las fases 3 a 5 son las más largas; si hay que recortar, se recortan los extras de fijos (suscripciones con prueba gratis) antes que el núcleo.
