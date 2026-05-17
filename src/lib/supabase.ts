import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificação de segurança (Antigravity Check)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Alerta: Variáveis de ambiente do Supabase não configuradas no .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
