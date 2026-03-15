import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Gift, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { giftSets as initialGiftSets } from '@/data/products';

interface GiftSetsProps {
  addToCart: (product: { 
    id: number; 
    name: string; 
    nameKo: string;
    nameRu: string;
    price: number; 
    image: string 
  }) => void;
  language: 'en' | 'ko' | 'ru';
}

const GiftSets = ({ addToCart, language }: GiftSetsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [giftSets, setGiftSets] = useState(initialGiftSets);

  // Load gift sets from localStorage on mount
  useEffect(() => {
    const savedGiftSets = localStorage.getItem('lumi_tea_giftsets');
    if (savedGiftSets) {
      setGiftSets(JSON.parse(savedGiftSets));
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedGiftSets = localStorage.getItem('lumi_tea_giftsets');
      if (savedGiftSets) {
        setGiftSets(JSON.parse(savedGiftSets));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getSetName = (set: typeof giftSets[0]) => {
    switch (language) {
      case 'ko': return set.nameKo;
      case 'ru': return set.nameRu;
      default: return set.name;
    }
  };

  const getSetDesc = (set: typeof giftSets[0]) => {
    switch (language) {
      case 'ko': return set.descriptionKo;
      case 'ru': return set.descriptionRu;
      default: return set.description;
    }
  };

  const content = {
    en: {
      badge: 'Gift Sets',
      title: 'Perfect',
      subtitle: 'Gift',
      description: 'Beautifully packaged sets for your loved ones and business partners',
      includes: 'Includes:',
      bestseller: 'Bestseller',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      customGift: 'Want a custom gift?',
      customText: 'We create personalized sets just for you. Add a greeting card and wrap it your way.',
      contactUs: 'Contact Us'
    },
    ko: {
      badge: '선물 세트',
      title: '완벽한',
      subtitle: '선물',
      description: '소중한 사람과 비즈니스 파트너를 위한 아름답게 포장된 세트',
      includes: '포함:',
      bestseller: '베스트셀러',
      addToCart: '장바구니에 담기',
      outOfStock: '품절',
      customGift: '커스텀 선물을 원하세요?',
      customText: '당신만을 위한 개인화된 세트를 만듭니다. 인사말 카드를 추가하고 원하는 대로 포장하세요.',
      contactUs: '문의하기'
    },
    ru: {
      badge: 'Подарочные наборы',
      title: 'Идеальный',
      subtitle: 'Подарок',
      description: 'Красиво упакованные наборы для ваших близких и деловых партнёров',
      includes: 'В наборе:',
      bestseller: 'Бестселлер',
      addToCart: 'В корзину',
      outOfStock: 'Нет в наличии',
      customGift: 'Хотите особенный подарок?',
      customText: 'Мы создадим персонализированный набор специально для вас. Добавим поздравительную открытку и упакуем по вашему желанию.',
      contactUs: 'Связаться'
    }
  };

  const t = content[language];

  return (
    <section id="gift-sets" ref={sectionRef} className="py-20 lg:py-32 bg-gradient-to-b from-pink-50 to-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 reveal opacity-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-pink-600 mb-6">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">{t.badge}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title} <span className="gradient-text">{t.subtitle}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Gift Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {giftSets.map((set, index) => (
            <div
              key={set.id}
              className={`reveal opacity-0 tea-card bg-white rounded-3xl overflow-hidden shadow-xl ${set.outOfStock ? 'opacity-75' : ''}`}
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={set.image}
                  alt={getSetName(set)}
                  className={`w-full h-full object-cover transition-transform duration-500 ${set.outOfStock ? '' : 'hover:scale-110'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Out of Stock Ribbon */}
                {set.outOfStock && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-red-500 text-white text-xs font-bold px-8 py-1 transform rotate-45 translate-x-6 translate-y-4 shadow-lg">
                      {t.outOfStock}
                    </div>
                  </div>
                )}
                
                {set.bestseller && !set.outOfStock && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-pink-500 text-white px-3 py-1">
                      {t.bestseller}
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{getSetName(set)}</h3>
                  <p className="text-white/80 text-sm">{getSetDesc(set)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Includes List */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">{t.includes}</p>
                  <ul className="space-y-2">
                    {set.includes.map((item, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${set.outOfStock ? 'text-gray-400' : 'text-gray-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${set.outOfStock ? 'bg-gray-300' : 'bg-pink-400'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`text-3xl font-bold ${set.outOfStock ? 'text-gray-400' : 'text-pink-500'}`}>
                    {set.price.toLocaleString()} ₩
                  </span>
                  <div className="flex gap-2">
                    {!set.outOfStock && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-pink-200 hover:bg-pink-50"
                        >
                          <Heart className="w-4 h-4 text-pink-500" />
                        </Button>
                        <Button
                          onClick={() => addToCart({
                            id: set.id,
                            name: set.name,
                            nameKo: set.nameKo,
                            nameRu: set.nameRu,
                            price: set.price,
                            image: set.image
                          })}
                          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {t.addToCart}
                        </Button>
                      </>
                    )}
                    {set.outOfStock && (
                      <Badge variant="secondary" className="bg-gray-200 text-gray-500 px-4 py-2">
                        {t.outOfStock}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Gift Message */}
        <div className="mt-16 text-center reveal opacity-0" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-3">{t.customGift}</h3>
            <p className="text-gray-600 mb-6">
              {t.customText}
            </p>
            <Button 
              variant="outline" 
              className="border-pink-500 text-pink-500 hover:bg-pink-50"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.contactUs}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftSets;
