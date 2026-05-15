/**
 * Uploads /public/*.jpg into Supabase Storage bucket `product-images`.
 * Run after seed.ts (and after creating the bucket via Supabase Dashboard, public read).
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx backend/supabase/seed/upload-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'product-images';
const PUBLIC_DIR = join(process.cwd(), 'public');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

(async () => {
  const files = (await readdir(PUBLIC_DIR)).filter((f) => MIME[extname(f).toLowerCase()]);
  console.log(`Uploading ${files.length} files to bucket "${BUCKET}"`);
  for (const f of files) {
    const data = await readFile(join(PUBLIC_DIR, f));
    const contentType = MIME[extname(f).toLowerCase()];
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(f, data, { contentType, upsert: true });
    if (error) {
      console.error(`✗ ${f}: ${error.message}`);
    } else {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f);
      console.log(`✓ ${f} → ${pub.publicUrl}`);
    }
  }
})();
