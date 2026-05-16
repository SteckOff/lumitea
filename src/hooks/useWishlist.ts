// Wishlist — localStorage-backed favourites. Each entry is a productId.
// On sign-in we could later sync to a `wishlists` table in Supabase.

import { useEffect, useState, useCallback } from 'react';

const KEY = 'lumi_wishlist_v1';

function read(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<number[]>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setIds(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((next: number[]) => {
    setIds(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (id: number) => {
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      persist(next);
    },
    [ids, persist],
  );

  const has = useCallback((id: number) => ids.includes(id), [ids]);

  const clear = useCallback(() => persist([]), [persist]);

  return { ids, toggle, has, clear, count: ids.length };
}
