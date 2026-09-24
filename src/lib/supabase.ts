import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// TODO: Pass Database generic once src/lib/database.types.ts is generated
export const supabase = createClient(supabaseUrl || '', supabasePublishableKey || '')