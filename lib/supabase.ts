import { createClient } from '@supabase/supabase-js';

// Support both Vite (VITE_*) and Vercel/Next.js (NEXT_PUBLIC_*) env var formats
const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.database_SUPABASE_URL
) as string;

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.database_SUPABASE_ANON_KEY
) as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
