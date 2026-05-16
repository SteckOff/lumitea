// Free-shipping progress banner — fixed at the top of every page.
// Shows how much more the user needs to add for free shipping, or celebrates
// when they're already there.

import { useState, useEffect } from 'react';
import { Truck, X } from 'lucide-react';

interface Props {
  cartSubtotal: number; // KRW
  threshold?: number;    // default ₩50,000
  language?: 'en' | 'ko' | 'ru';
}

const STORAGE_KEY = 'lumi_shipping_banner_dismissed_v1';

export function FreeShippingBanner({
  cartSubtotal,
  threshold = 50000,
  language = 'en',
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  if (dismissed) return null;

  const remaining = Math.max(0, threshold - cartSubtotal);
  const pct = Math.min(100, (cartSubtotal / threshold) * 100);
  const reached = remaining === 0;

  const T = {
    en: {
      need: `Add ${remaining.toLocaleString('ko-KR')} ₩ more for FREE shipping`,
      free: '🎉 You qualify for FREE shipping!',
    },
    ko: {
      need: `${remaining.toLocaleString('ko-KR')} ₩ 추가하시면 무료배송!`,
      free: '🎉 무료배송 대상입니다!',
    },
    ru: {
      need: `Добавьте ещё ${remaining.toLocaleString('ko-KR')} ₩ для БЕСПЛАТНОЙ доставки`,
      free: '🎉 Бесплатная доставка активирована!',
    },
  }[language];

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="relative bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 text-white text-xs sm:text-sm font-medium overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-white/15 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
      <div className="relative flex items-center justify-center gap-2 px-12 py-2">
        <Truck className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{reached ? T.free : T.need}</span>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
