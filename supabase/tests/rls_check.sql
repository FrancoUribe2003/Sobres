-- ============================================================================
-- SCRIPT DE VERIFICACIÓN DE RLS (Row Level Security)
-- ============================================================================
-- Instrucciones:
-- 1. Reemplazá 'USER_A_UUID_AQUI' y 'USER_B_UUID_AQUI' por los UUIDs reales
--    de dos usuarios creados en Supabase Auth.
-- 2. Copiá y pegá todo este script en el SQL Editor del dashboard de Supabase.
-- 3. Ejecutalo. Todo corre en una transacción con ROLLBACK final para no dejar datos.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  -- >>> COMPLETAR CON UUIDS DE DOS USUARIOS REALES <<<
  v_user_a uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_user_b uuid := '00000000-0000-0000-0000-000000000002'::uuid;

  v_cat_a_id uuid;
  v_count integer;
  v_error_caught boolean;
BEGIN
  RAISE NOTICE 'Iniciando pruebas de verificación RLS con Usuario A (%) y Usuario B (%)', v_user_a, v_user_b;

  -- --------------------------------------------------------------------------
  -- 0. Preparar datos de prueba para el Usuario A (actuando como postgres/superuser)
  -- --------------------------------------------------------------------------
  -- Asegurar perfil A
  INSERT INTO public.profiles (id, display_name, display_currency, work_mode)
  VALUES (v_user_a, 'Usuario A', 'ARS', 'full_time')
  ON CONFLICT (id) DO UPDATE SET display_name = 'Usuario A';

  -- Categoría de prueba para A
  INSERT INTO public.categories (id, user_id, name, limit_currency)
  VALUES (gen_random_uuid(), v_user_a, 'Supermercado A', 'ARS')
  RETURNING id INTO v_cat_a_id;

  -- Ingreso y gasto para A
  INSERT INTO public.incomes (user_id, description, amount, currency, date, status)
  VALUES (v_user_a, 'Sueldo A', 100000, 'ARS', CURRENT_DATE, 'received');

  INSERT INTO public.expenses (user_id, category_id, description, amount, currency, date)
  VALUES (v_user_a, v_cat_a_id, 'Compra A', 1500, 'ARS', CURRENT_DATE);

  INSERT INTO public.recurring_incomes (user_id, description, amount, currency, day_of_month)
  VALUES (v_user_a, 'Recurrente A', 50000, 'ARS', 1);

  INSERT INTO public.fixed_expenses (user_id, category_id, name, amount, currency, day_of_month)
  VALUES (v_user_a, v_cat_a_id, 'Internet A', 20000, 'ARS', 10);

  -- --------------------------------------------------------------------------
  -- 1. Simulamos sesión autenticada como Usuario B
  -- --------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_user_b, 'role', 'authenticated')::text, true);
  SET LOCAL role = authenticated;

  -- 1.1 B no puede leer el perfil de A
  SELECT count(*) INTO v_count FROM public.profiles WHERE id = v_user_a;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FALLÓ: Usuario B pudo leer el perfil de A';
  END IF;
  RAISE NOTICE 'OK: Usuario B no puede leer el perfil de A';

  -- 1.2 B no puede actualizar el perfil de A
  UPDATE public.profiles SET display_name = 'Modificado por B' WHERE id = v_user_a;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FALLÓ: Usuario B pudo modificar el perfil de A';
  END IF;
  RAISE NOTICE 'OK: Usuario B no puede modificar el perfil de A';

  -- 1.3 B no puede leer categorías, ingresos, gastos, recurrentes ni fijos de A
  SELECT count(*) INTO v_count FROM public.categories WHERE user_id = v_user_a;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: B pudo leer categorías de A'; END IF;

  SELECT count(*) INTO v_count FROM public.incomes WHERE user_id = v_user_a;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: B pudo leer ingresos de A'; END IF;

  SELECT count(*) INTO v_count FROM public.expenses WHERE user_id = v_user_a;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: B pudo leer gastos de A'; END IF;

  SELECT count(*) INTO v_count FROM public.recurring_incomes WHERE user_id = v_user_a;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: B pudo leer ingresos recurrentes de A'; END IF;

  SELECT count(*) INTO v_count FROM public.fixed_expenses WHERE user_id = v_user_a;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: B pudo leer gastos fijos de A'; END IF;
  RAISE NOTICE 'OK: Usuario B no puede leer ninguna tabla financiera de A';

  -- 1.4 B no puede insertar datos asignándolos a A
  v_error_caught := false;
  BEGIN
    INSERT INTO public.categories (user_id, name, limit_currency)
    VALUES (v_user_a, 'Intento hack de B', 'ARS');
  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
  END;
  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'FALLÓ: Usuario B pudo insertar una categoría asignada al Usuario A';
  END IF;
  RAISE NOTICE 'OK: Usuario B no puede insertar registros asignados al Usuario A';

  -- 1.5 B no puede crear un gasto que use una categoría de A
  v_error_caught := false;
  BEGIN
    INSERT INTO public.expenses (user_id, category_id, description, amount, currency, date)
    VALUES (v_user_b, v_cat_a_id, 'Gasto cruzado', 500, 'ARS', CURRENT_DATE);
  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
  END;
  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'FALLÓ: Usuario B pudo crear un gasto con la categoría de A';
  END IF;
  RAISE NOTICE 'OK: Usuario B no puede usar categorías ajenas en sus gastos';

  -- 1.6 B no puede escribir en exchange_rates (solo lectura)
  v_error_caught := false;
  BEGIN
    INSERT INTO public.exchange_rates (type, buy, sell, source)
    VALUES ('blue', 1200, 1220, 'hack');
  EXCEPTION WHEN OTHERS THEN
    v_error_caught := true;
  END;
  IF NOT v_error_caught THEN
    RAISE EXCEPTION 'FALLÓ: Usuario autenticado pudo escribir en exchange_rates';
  END IF;
  RAISE NOTICE 'OK: exchange_rates no permite inserción a usuarios autenticados';

  -- --------------------------------------------------------------------------
  -- 2. Rol anon (usuario no autenticado)
  -- --------------------------------------------------------------------------
  SET LOCAL role = anon;
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}', true);

  SELECT count(*) INTO v_count FROM public.profiles;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: anon pudo leer profiles'; END IF;

  SELECT count(*) INTO v_count FROM public.categories;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: anon pudo leer categories'; END IF;

  SELECT count(*) INTO v_count FROM public.incomes;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: anon pudo leer incomes'; END IF;

  SELECT count(*) INTO v_count FROM public.expenses;
  IF v_count <> 0 THEN RAISE EXCEPTION 'FALLÓ: anon pudo leer expenses'; END IF;
  RAISE NOTICE 'OK: Rol anon no tiene acceso a ninguna tabla de usuario';

  RAISE NOTICE '=========================================================';
  RAISE NOTICE '¡TODAS LAS PRUEBAS DE SEGURIDAD RLS PASARON CON ÉXITO!';
  RAISE NOTICE '=========================================================';
END $$;

ROLLBACK;
