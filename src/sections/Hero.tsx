import { useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  language: 'en' | 'ko' | 'ru';
}

const Hero = ({ language }: HeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);

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

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const content = {
    en: {
      badge: 'Premium Korean Tea',
      title: 'Lumi',
      subtitle: 'Tea',
      description: 'Discover the world of exquisite tea, where every cup is a journey to the blooming gardens of Korea under sakura petals',
      cta1: 'Shop Now',
      cta2: 'Learn More'
    },
    ko: {
      badge: '프리미엄 한국 차',
      title: '루미',
      subtitle: '티',
      description: '벚꽃 아래 한국의 꽃 피는 정원으로의 여정이 되는 한 잔의 차, 고급스러운 차의 세계를 발견하세요',
      cta1: '지금 쇼핑하기',
      cta2: '더 알아보기'
    },
    ru: {
      badge: 'Премиальный чай из Кореи',
      title: 'Lumi',
      subtitle: 'Tea',
      description: 'Откройте для себя мир изысканного чая, где каждая чашка — это путешествие в цветущие сады Кореи под лепестками сакуры',
      cta1: 'Купить сейчас',
      cta2: 'Узнать больше'
    }
  };

  const t = content[language];

  return (
    <section 
      id="hero" 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/hero_tea.jpg" 
          alt="Lumi Tea" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="reveal opacity-0" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t.badge}</span>
          </div>
        </div>

        <h1 className="reveal opacity-0 text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6" style={{ animationDelay: '0.4s' }}>
          {t.title}
          <span className="block text-pink-300">{t.subtitle}</span>
        </h1>

        <p className="reveal opacity-0 text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto" style={{ animationDelay: '0.6s' }}>
          {t.description}
        </p>

        <div className="reveal opacity-0 flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.8s' }}>
          <Button 
            size="lg" 
            onClick={scrollToProducts}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-full"
          >
            {t.cta1}
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-white/80 text-white bg-transparent hover:bg-white/20 hover:border-white px-8 py-6 text-lg rounded-full backdrop-blur-sm"
          >
            {t.cta2}
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/70" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl" />
    </section>
  );
};

export default Hero;
