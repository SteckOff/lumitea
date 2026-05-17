import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';

interface Props {
  cartSubtotal: number;
  threshold?: number;
  language?: 'en' | 'ko' | 'ru';
}

const STORAGE_KEY = 'lumi_shipping_banner_dismissed_v2';

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
      need: (
        <>
          <Truck className="inline w-3.5 h-3.5 mr-1.5 opacity-80" />
          Add <strong className="font-semibold">{remaining.toLocaleString('ko-KR')} ₩</strong> more for <strong className="font-semibold">FREE shipping</strong>
        </>
      ),
      free: '🎉 You qualify for FREE shipping!',
    },
    ko: {
      need: (
        <>
          <Truck className="inline w-3.5 h-3.5 mr-1.5 opacity-80" />
          <strong className="font-semibold">{remaining.toLocaleString('ko-KR')} ₩</strong> 더 담으면 무료배송
        </>
      ),
      free: '🎉 무료배송 대상입니다!',
    },
    ru: {
      need: (
        <>
          <Truck className="inline w-3.5 h-3.5 mr-1.5 opacity-80" />
          Ещё <strong className="font-semibold">{remaining.toLocaleString('ko-KR')} ₩</strong> до <strong className="font-semibold">бесплатной доставки</strong>
        </>
      ),
      free: '🎉 Бесплатная доставка активирована!',
    },
  }[language];

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      {/* Subtle pink progress underline */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 py-2.5 text-[11px] sm:text-xs tracking-wide">
          <span className={reached ? 'text-green-400' : 'text-gray-300'}>
            {reached ? T.free : T.need}
          </span>
        </div>
      </div>

      {/* Close button — subtle, top-right corner */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors leading-none text-base font-light"
      >
        ×
      </button>
    </div>
  );
}
