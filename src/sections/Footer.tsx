import { Heart, Instagram, MessageCircle, Mail, Send, MapPin, Phone, Facebook, Youtube } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

interface FooterProps {
  language: 'en' | 'ko' | 'ru';
  onNavigate?: (page: 'home' | 'blog' | 'faq' | 'careers') => void;
}

// Korean Social Media Icons as SVG components
const KakaoTalkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.63 1.54 4.96 3.93 6.42-.17.71-.64 2.57-.74 2.97-.12.47.18.46.37.33.15-.1 2.42-1.64 3.4-2.31.57.16 1.17.24 1.79.24 5.52 0 10-3.58 10-8s-4.48-8-10-8zm-1.25 9.5H8.5v-4h2.25v4zm4.5 0h-2.25v-4H15.25v4z"/>
  </svg>
);

const NaverIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.155L16.624 24H24V0h-7.727v12.845z"/>
  </svg>
);

const Footer = ({ language, onNavigate }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      
      // Save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('lumi_tea_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('lumi_tea_subscribers', JSON.stringify(subscribers));
      }
      
      // Send email via API
      try {
        await api.subscribe(email);
      } catch (error) {
        console.log('API not available, but subscription saved');
      }
      
      setSubscribed(true);
      setEmail('');
      setIsLoading(false);
    }
  };

  const content = {
    en: {
      description: 'Premium Korean tea delivered throughout South Korea. Discover the world of exquisite tea ceremony.',
      shop: 'Shop',
      company: 'Company',
      support: 'Support',
      careers: 'Careers',
      newsletter: 'Subscribe to our newsletter',
      newsletterDesc: 'Get exclusive offers and news',
      subscribe: 'Subscribe',
      subscribed: 'Subscribed!',
      madeWith: 'Made with',
      inSeoul: 'in Incheon',
      rights: 'All rights reserved.',
      address: 'Incheon Yeonsu-gu Hambak-ro 12beon-gil 14',
      phone: '+82 10 2187 3643',
      email: 'lumitea.kr@gmail.com',
      followUs: 'Follow Us'
    },
    ko: {
      description: '전국 배송되는 프리미엄 한국 차. 고급스러운 다도의 세계를 발견하세요.',
      shop: '상점',
      company: '회사',
      support: '지원',
      careers: '채용',
      newsletter: '뉴스레터 구독',
      newsletterDesc: '독점 혜택과 소식을 받아보세요',
      subscribe: '구독하기',
      subscribed: '구독 완료!',
      madeWith: '만든 곳:',
      inSeoul: '인천',
      rights: '모든 권리 보유.',
      address: '인천 연수구 함박로12번길 14',
      phone: '+82 10 2187 3643',
      email: 'lumitea.kr@gmail.com',
      followUs: '팔로우하기'
    },
    ru: {
      description: 'Премиальный чай из Кореи с доставкой по всей стране. Откройте для себя мир изысканного чаепития.',
      shop: 'Магазин',
      company: 'Компания',
      support: 'Поддержка',
      careers: 'Вакансии',
      newsletter: 'Подпишитесь на новости',
      newsletterDesc: 'Получайте эксклюзивные предложения и новости',
      subscribe: 'Подписаться',
      subscribed: 'Подписано!',
      madeWith: 'Сделано с',
      inSeoul: 'в Инчхоне',
      rights: 'Все права защищены.',
      address: 'Incheon Yeonsu-gu Hambak-ro 12beon-gil 14',
      phone: '+82 10 2187 3643',
      email: 'lumitea.kr@gmail.com',
      followUs: 'Мы в соцсетях'
    }
  };

  const t = content[language];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (page: 'home' | 'blog' | 'faq' | 'careers') => {
    if (onNavigate) {
      onNavigate(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Social media platforms - all circular style
  const socialLinks = [
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      href: 'https://instagram.com/_lumi__tea_',
      bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'
    },
    {
      name: 'KakaoTalk',
      icon: <KakaoTalkIcon />,
      href: '#',
      bgColor: 'bg-yellow-400'
    },
    {
      name: 'Naver',
      icon: <NaverIcon />,
      href: '#',
      bgColor: 'bg-green-500'
    },
    {
      name: 'Telegram',
      icon: <MessageCircle className="w-5 h-5" />,
      href: 'https://t.me/lumi_chai',
      bgColor: 'bg-blue-400'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      href: '#',
      bgColor: 'bg-blue-600'
    },
    {
      name: 'YouTube',
      icon: <Youtube className="w-5 h-5" />,
      href: '#',
      bgColor: 'bg-red-500'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Lumi Tea" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold">Lumi Tea</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{t.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <a href={`tel:${t.phone.replace(/\s/g, '')}`} className="hover:text-pink-400 transition-colors">{t.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${t.email}`} className="hover:text-pink-400 transition-colors">{t.email}</a>
              </div>
            </div>
            
            {/* Social Links - Circular Style */}
            <div>
              <p className="text-sm font-medium text-gray-300 mb-3">{t.followUs}</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full ${social.bgColor} flex items-center justify-center hover:opacity-80 transition-opacity text-white`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-bold mb-4">{t.shop}</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('#products')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'All Teas' : language === 'ko' ? '모든 차' : 'Все чаи'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#gift-sets')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'Gift Sets' : language === 'ko' ? '선물 세트' : 'Подарочные наборы'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#products')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'New Arrivals' : language === 'ko' ? '신제품' : 'Новинки'}
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4">{t.company}</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('#about')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'About Us' : language === 'ko' ? '소개' : 'О нас'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('blog')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'Blog' : language === 'ko' ? '블로그' : 'Блог'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('careers')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {t.careers}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-bold mb-4">{t.support}</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('#contact')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'Contact' : language === 'ko' ? '연락처' : 'Контакты'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#contact')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'Shipping' : language === 'ko' ? '배송' : 'Доставка'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('faq')}
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  {language === 'en' ? 'FAQ' : language === 'ko' ? '자주 묻는 질문' : 'FAQ'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold mb-1">{t.newsletter}</h4>
              <p className="text-gray-400 text-sm">{t.newsletterDesc}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                required
              />
              <Button 
                type="submit" 
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors flex items-center gap-2"
                disabled={subscribed || isLoading}
              >
                {isLoading ? '...' : subscribed ? t.subscribed : <><Send className="w-4 h-4" /> {t.subscribe}</>}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Lumi Tea. {t.rights}
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            {t.madeWith} <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> {t.inSeoul}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
