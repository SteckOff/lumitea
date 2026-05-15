import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ProductRow, GiftSetRow } from '@/lib/database.types';
import type { Product } from '@/data/products';

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    nameKo: r.name_ko,
    nameRu: r.name_ru,
    category: r.category,
    price: r.price,
    originalPrice: r.original_price ?? undefined,
    description: r.description,
    descriptionKo: r.description_ko,
    descriptionRu: r.description_ru,
    tags: r.tags,
    tagsKo: r.tags_ko,
    tagsRu: r.tags_ru,
    image: r.image_url,
    bestseller: r.bestseller,
    new: r.is_new,
    weight: r.weight,
    stock: r.stock,
    outOfStock: r.out_of_stock,
  };
}

export interface GiftSetUi {
  id: number;
  name: string;
  nameKo: string;
  nameRu: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionKo: string;
  descriptionRu: string;
  includes: string[];
  image: string;
  bestseller?: boolean;
  new?: boolean;
  stock: number;
  outOfStock?: boolean;
}

function rowToGiftSet(r: GiftSetRow): GiftSetUi {
  return {
    id: r.id,
    name: r.name,
    nameKo: r.name_ko,
    nameRu: r.name_ru,
    price: r.price,
    originalPrice: r.original_price ?? undefined,
    description: r.description,
    descriptionKo: r.description_ko,
    descriptionRu: r.description_ru,
    includes: r.includes ?? [],
    image: r.image_url,
    bestseller: r.bestseller,
    new: r.is_new,
    stock: r.stock,
    outOfStock: r.out_of_stock,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('bestseller', { ascending: false })
        .order('id');
      if (cancelled) return;
      if (error) {
        setError(error);
      } else {
        setProducts((data ?? []).map(rowToProduct));
      }
      setLoading(false);
    }

    load();

    // Realtime: when admin tweaks stock/price/visibility, push to all clients.
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, loading, error };
}

export function useGiftSets() {
  const [giftSets, setGiftSets] = useState<GiftSetUi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from('gift_sets')
        .select('*')
        .eq('is_active', true)
        .order('bestseller', { ascending: false })
        .order('id');
      if (cancelled) return;
      setGiftSets((data ?? []).map(rowToGiftSet));
      setLoading(false);
    }

    load();
    const channel = supabase
      .channel('gift-sets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gift_sets' },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { giftSets, loading };
}
