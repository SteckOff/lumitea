import { useEffect, useRef } from 'react';
import { Leaf, Award, Truck, Heart, MapPin } from 'lucide-react';

interface AboutProps {
  language: 'en' | 'ko' | 'ru';
}

const About = ({ language }: AboutProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const content = {
    en: {
      location: 'Incheon, South Korea',
      title: 'Our',
      subtitle: 'Story',
      story1: 'Lumi Tea was born from a love of Korean tea culture and a desire to share this beauty with the world. Our name comes from the Korean word "눈" (nun) — snow, and the French "lumière" — light.',
      story2: 'We work directly with tea farmers from Boseong, Jeju, and Hadong regions, where the best tea in Korea is grown. Each variety undergoes strict selection so you receive only premium quality.',
      story3: 'Our philosophy — tea as art. Every cup is a moment of peace and contemplation in the hustle of modern life.',
      customers: 'Happy Customers',
      years: 'Years Experience',
      varieties: 'Tea Varieties',
      natural: 'Natural',
      whyTitle: 'Why Choose',
      whySubtitle: 'Lumi Tea',
      features: [
        { title: '100% Natural', desc: 'All our teas are grown without pesticides and chemicals' },
        { title: 'Premium Quality', desc: 'Select leaves only from the best Korean tea plantations' },
        { title: 'Fast Delivery', desc: 'Delivery throughout Korea within 1-3 business days' },
        { title: 'With Care', desc: 'Every order is packed with love and attention to detail' }
      ]
    },
    ko: {
      location: '인천, 대한민국',
      title: '우리의',
      subtitle: '이야기',
      story1: '루미 티는 한국 차 문화에 대한 사랑과 이 아름다움을 세상과 나누고자 하는 열정에서 탄생했습니다. 우리 이름은 한국어 "눈"과 프랑스어 "lumière"(빛)에서 유래했습니다.',
      story2: '한국 최고의 차가 생산되는 보성, 제주, 하동 지역의 차 농부들과 직접 협력합니다. 각 품종은 엄격한 선별을 거쳐 프리미엄 품질만 제공합니다.',
      story3: '우리의 철학 — 차는 예술입니다. 매 한 잔은 현대 생활의 소란 속 평화와 명상의 순간입니다.',
      customers: '행복한 고객',
      years: '년 경험',
      varieties: '차 품종',
      natural: '천연',
      whyTitle: '왜 선택하는가',
      whySubtitle: '루미 티',
      features: [
        { title: '100% 천연', desc: '모든 차는 농약과 화학물질 없이 재배됩니다' },
        { title: '프리미엄 품질', desc: '최고의 한국 차밭에서 엄선된 잎만 사용' },
        { title: '빠른 배송', desc: '전국 1-3 영업일 배송' },
        { title: '정성으로', desc: '모든 주문은 사랑과 세심한 주의로 포장됩니다' }
      ]
    },
    ru: {
      location: 'Инчхон, Южная Корея',
      title: 'Наша',
      subtitle: 'История',
      story1: 'Lumi Tea родилась из любви к корейской чайной культуре и желания поделиться этой красотой с миром. Наше название происходит от корейского слова "눈" (nun) — снег, и французского "lumière" — свет.',
      story2: 'Мы работаем напрямую с чайными фермерами из регионов Босонг, Чеджу и Хадон, где выращивают лучший чай в Корее. Каждый сорт проходит строгий отбор, чтобы вы получили только премиальное качество.',
      story3: 'Наша философия — чай как искусство. Каждая чашка — это момент покоя и созерцания в суете современной жизни.',
      customers: 'Довольных клиентов',
      years: 'Лет опыта',
      varieties: 'Сортов чая',
      natural: 'Натуральность',
      whyTitle: 'Почему выбирают',
      whySubtitle: 'Lumi Tea',
      features: [
        { title: '100% Натурально', desc: 'Все наши чаи выращены без пестицидов и химических добавок' },
        { title: 'Премиум Качество', desc: 'Отборные листья только с лучших чайных плантаций Кореи' },
        { title: 'Быстрая Доставка', desc: 'Доставляем по всей Корее в течение 1-3 рабочих дней' },
        { title: 'С Заботой', desc: 'Каждый заказ упакован с любовью и вниманием к деталям' }
      ]
    }
  };

  const t = content[language];

  const stats = [
    { value: '10K+', label: t.customers },
    { value: '5+', label: t.years },
    { value: '22+', label: t.varieties },
    { value: '100%', label: t.natural }
  ];

  const features = [
    { icon: <Leaf className="w-8 h-8" />, title: t.features[0].title, description: t.features[0].desc },
    { icon: <Award className="w-8 h-8" />, title: t.features[1].title, description: t.features[1].desc },
    { icon: <Truck className="w-8 h-8" />, title: t.features[2].title, description: t.features[2].desc },
    { icon: <Heart className="w-8 h-8" />, title: t.features[3].title, description: t.features[3].desc }
  ];

  return (
    <section id="about" ref={sectionRef} className="py-20 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="reveal opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-pink-600 mb-6">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{t.location}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.title} <span className="gradient-text">{t.subtitle}</span>
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>{t.story1}</p>
              <p>{t.story2}</p>
              <p>{t.story3}</p>
            </div>
          </div>

          <div className="reveal opacity-0 relative" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <img
                src="/hero_tea.jpg"
                alt="Lumi Tea Story"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-pink-500 mb-1">5+</div>
                <div className="text-gray-600">{t.years}</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-pink-500 rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-white mb-1">22+</div>
                <div className="text-white/80">{t.varieties}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="reveal opacity-0 bg-white rounded-2xl p-6 text-center shadow-lg"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="reveal opacity-0" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-2xl font-bold text-center mb-10">
            {t.whyTitle} <span className="gradient-text">{t.whySubtitle}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500 mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
