import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StripeProvider } from '@/components/StripeProvider';
import { CheckoutForm } from '@/components/CheckoutForm';
import { AuthModal } from '@/components/AuthModal';
import { AdminPanel } from '@/components/AdminPanel';
import { ChatWidget } from '@/components/ChatWidget';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BlogPage } from '@/pages/Blog';
import { FAQPage } from '@/pages/FAQ';
import { CareersPage } from '@/pages/Careers';
import Hero from './sections/Hero';
import Products from './sections/Products';
import About from './sections/About';
import GiftSets from './sections/GiftSets';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

export interface CartItem {
  id: number;
  name: string;
  nameKo: string;
  nameRu: string;
  price: number;
  quantity: number;
  image: string;
}

type Language = 'en' | 'ko' | 'ru';
type Page = 'home' | 'blog' | 'faq' | 'careers';

function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Auto-detect language from browser
  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ko')) return 'ko';
      if (browserLang.startsWith('ru')) return 'ru';
      return 'en';
    };
    
    const savedLang = localStorage.getItem('lumi_tea_language') as Language;
    if (savedLang && ['en', 'ko', 'ru'].includes(savedLang)) {
      setLanguage(savedLang);
    } else {
      const detected = detectLanguage();
      setLanguage(detected);
      localStorage.setItem('lumi_tea_language', detected);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('lumi_tea_language', lang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create sakura petals
  useEffect(() => {
    const createPetal = () => {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      petal.style.left = Math.random() * 100 + 'vw';
      petal.style.animationDuration = (Math.random() * 5 + 5) + 's';
      petal.style.opacity = String(Math.random() * 0.5 + 0.3);
      document.body.appendChild(petal);
      
      setTimeout(() => {
        petal.remove();
      }, 10000);
    };

    const interval = setInterval(createPetal, 2000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product: { 
    id: number; 
    name: string; 
    nameKo: string;
    nameRu: string;
    price: number; 
    image: string 
  }) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const getProductName = (item: CartItem) => {
    switch (language) {
      case 'ko': return item.nameKo;
      case 'ru': return item.nameRu;
      default: return item.name;
    }
  };

  const translations = {
    en: {
      shop: 'Shop',
      giftSets: 'Gift Sets',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
      emptyCart: 'Your cart is empty',
      total: 'Total',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      login: 'Login',
      logout: 'Logout',
      welcome: 'Welcome',
      admin: 'Admin',
      blog: 'Blog',
      faq: 'FAQ',
      careers: 'Careers'
    },
    ko: {
      shop: '상점',
      giftSets: '선물 세트',
      about: '소개',
      contact: '연락처',
      cart: '장바구니',
      emptyCart: '장바구니가 비어 있습니다',
      total: '합계',
      checkout: '결제하기',
      continueShopping: '쇼핑 계속하기',
      login: '로그인',
      logout: '로그아웃',
      welcome: '환영합니다',
      admin: '관리자',
      blog: '블로그',
      faq: '자주 묻는 질문',
      careers: '채용'
    },
    ru: {
      shop: 'Магазин',
      giftSets: 'Подарочные наборы',
      about: 'О нас',
      contact: 'Контакты',
      cart: 'Корзина',
      emptyCart: 'Корзина пуста',
      total: 'Итого',
      checkout: 'Оформить заказ',
      continueShopping: 'Продолжить покупки',
      login: 'Вход',
      logout: 'Выйти',
      welcome: 'Добро пожаловать',
      admin: 'Админ',
      blog: 'Блог',
      faq: 'FAQ',
      careers: 'Вакансии'
    }
  };

  const t = translations[language];

  // Render different pages
  if (currentPage === 'blog') {
    return (
      <div className="min-h-screen bg-cream">
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <button 
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-2"
              >
                <img src="/logo.png" alt="Lumi Tea" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold gradient-text">Lumi Tea</span>
              </button>
              <div className="hidden sm:flex items-center gap-1 bg-white/80 rounded-full p-1">
                {(['en', 'ko', 'ru'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      language === lang
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-600 hover:text-pink-500'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-20">
          <BlogPage language={language} onBack={() => setCurrentPage('home')} />
        </div>
        <ChatWidget language={language} />
      </div>
    );
  }

  if (currentPage === 'faq') {
    return (
      <div className="min-h-screen bg-cream">
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <button 
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-2"
              >
                <img src="/logo.png" alt="Lumi Tea" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold gradient-text">Lumi Tea</span>
              </button>
              <div className="hidden sm:flex items-center gap-1 bg-white/80 rounded-full p-1">
                {(['en', 'ko', 'ru'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      language === lang
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-600 hover:text-pink-500'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-20">
          <FAQPage language={language} onBack={() => setCurrentPage('home')} />
        </div>
        <ChatWidget language={language} />
      </div>
    );
  }

  if (currentPage === 'careers') {
    return (
      <div className="min-h-screen bg-cream">
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <button 
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-2"
              >
                <img src="/logo.png" alt="Lumi Tea" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold gradient-text">Lumi Tea</span>
              </button>
              <div className="hidden sm:flex items-center gap-1 bg-white/80 rounded-full p-1">
                {(['en', 'ko', 'ru'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      language === lang
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-600 hover:text-pink-500'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="pt-20">
          <CareersPage language={language} onBack={() => setCurrentPage('home')} />
        </div>
        <ChatWidget language={language} />
      </div>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button 
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2"
            >
              <img src="/logo.png" alt="Lumi Tea" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold gradient-text">Lumi Tea</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('products')} className="text-gray-700 hover:text-pink-500 transition-colors">
                {t.shop}
              </button>
              <button onClick={() => scrollToSection('gift-sets')} className="text-gray-700 hover:text-pink-500 transition-colors">
                {t.giftSets}
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-pink-500 transition-colors">
                {t.about}
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-pink-500 transition-colors">
                {t.contact}
              </button>
            </div>

            {/* Language, Auth & Cart */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="hidden sm:flex items-center gap-1 bg-white/80 rounded-full p-1">
                {(['en', 'ko', 'ru'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      language === lang
                        ? 'bg-pink-500 text-white'
                        : 'text-gray-600 hover:text-pink-500'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Admin Button */}
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsAdminOpen(true)}
                  title={t.admin}
                  className="text-purple-500"
                >
                  <Shield className="w-5 h-5" />
                </Button>
              )}

              {/* Auth Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="hidden lg:inline text-sm text-gray-600">
                    {t.welcome}, {user?.name}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={logout}
                    title={t.logout}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsAuthOpen(true)}
                  title={t.login}
                >
                  <User className="w-5 h-5" />
                </Button>
              )}

              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <div className="flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-4">{t.cart}</h2>
                    {cart.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        {t.emptyCart}
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 overflow-auto space-y-4">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                              <img src={item.image} alt={getProductName(item)} className="w-20 h-20 object-cover rounded" />
                              <div className="flex-1">
                                <h3 className="font-medium">{getProductName(item)}</h3>
                                <p className="text-pink-500 font-bold">{item.price.toLocaleString()} ₩</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between mb-4">
                            <span className="font-medium">{t.total}:</span>
                            <span className="text-xl font-bold text-pink-500">{cartTotal.toLocaleString()} ₩</span>
                          </div>
                          <Button 
                            className="w-full btn-primary mb-2"
                            onClick={() => {
                              setIsCartOpen(false);
                              setIsCheckoutOpen(true);
                            }}
                          >
                            {t.checkout}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsCartOpen(false)}
                          >
                            {t.continueShopping}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mobile Menu */}
              <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-center gradient-text text-2xl">Lumi Tea</DialogTitle>
                  </DialogHeader>
                  <nav className="flex flex-col gap-4 mt-4">
                    <button 
                      onClick={() => scrollToSection('products')}
                      className="text-lg text-gray-700 hover:text-pink-500 py-2 border-b"
                    >
                      {t.shop}
                    </button>
                    <button 
                      onClick={() => scrollToSection('gift-sets')}
                      className="text-lg text-gray-700 hover:text-pink-500 py-2 border-b"
                    >
                      {t.giftSets}
                    </button>
                    <button 
                      onClick={() => scrollToSection('about')}
                      className="text-lg text-gray-700 hover:text-pink-500 py-2 border-b"
                    >
                      {t.about}
                    </button>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="text-lg text-gray-700 hover:text-pink-500 py-2 border-b"
                    >
                      {t.contact}
                    </button>
                  </nav>
                </DialogContent>
              </Dialog>

              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        language={language}
      />

      {/* Admin Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
      />

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text text-2xl">
              {language === 'en' ? 'Secure Checkout' : language === 'ko' ? '안전한 결제' : 'Безопасная оплата'}
            </DialogTitle>
          </DialogHeader>
          <CheckoutForm 
            amount={cartTotal}
            items={cart.map(item => ({ id: item.id, name: getProductName(item), quantity: item.quantity, price: item.price }))}
            onSuccess={() => {
              setCart([]);
              setIsCheckoutOpen(false);
            }}
            onCancel={() => setIsCheckoutOpen(false)}
            language={language}
          />
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main>
        <Hero language={language} />
        <Products addToCart={addToCart} language={language} />
        <GiftSets addToCart={addToCart} language={language} />
        <About language={language} />
        <Contact language={language} />
      </main>

      <Footer 
        language={language} 
        onNavigate={setCurrentPage}
      />

      {/* Chat Widget */}
      <ChatWidget language={language} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <StripeProvider>
        <AppContent />
      </StripeProvider>
    </AuthProvider>
  );
}

export default App;
