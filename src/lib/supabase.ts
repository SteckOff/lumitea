import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill them in.',
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? 'http://localhost:54321',
  SUPABASE_ANON_KEY ?? 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function publicImageUrl(path: string | null | undefined): string {
  if (!path) return '/tea_collection.jpg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}
