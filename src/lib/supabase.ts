import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface AnalysisResult {
  id: string
  user_id?: string
  results: any[]
  original_search_term: string
  is_public: boolean
  created_at: string
  expires_at: string
}