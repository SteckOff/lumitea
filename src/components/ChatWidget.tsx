import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  language: 'en' | 'ko' | 'ru';
}

// Simple AI responses based on keywords
const getAIResponse = (message: string, language: 'en' | 'ko' | 'ru'): string => {
  const lowerMsg = message.toLowerCase();
  
  const responses = {
    en: {
      greeting: ["Hello! Welcome to Lumi Tea! How can I help you today?", "Hi there! Looking for some premium Korean tea?"],
      price: ["Our tea prices range from 7,500 KRW to 35,000 KRW depending on the type. You can check our full catalog in the Shop section!"],
      shipping: ["We offer free shipping on orders over 50,000 KRW within South Korea. Delivery usually takes 2-3 business days."],
      payment: ["We accept credit cards, KakaoPay, Naver Pay, and bank transfers. All payments are secure through Stripe."],
      stock: ["You can check product availability on each product card. If an item is out of stock, it will be marked accordingly."],
      discount: ["We regularly offer discounts! Subscribe to our newsletter to get exclusive offers and updates on sales."],
      contact: ["You can reach us at lumitea.kr@gmail.com or call +82 10 2187 3643. We're also on Telegram @lumi_chai"],
      location: ["We're located in Incheon, South Korea. Our address is: Incheon Yeonsu-gu Hambak-ro 12beon-gil 14"],
      default: ["I'm not sure I understand. Could you rephrase that?", "For more detailed assistance, please leave your email and we'll get back to you!"]
    },
    ko: {
      greeting: ["안녕하세요! 루미 티에 오신 것을 환영합니다! 무엇을 도와드릴까요?", "안녕하세요! 프리미엄 한국 차를 찾으시나요?"],
      price: ["차 가격은 종류에 따라 7,500원부터 35,000원까지입니다. 전체 카탈로그는 상점 섹션에서 확인하세요!"],
      shipping: ["한국 내 5만원 이상 주문 시 물류비 물류가 제공됩니다. 배송은 보통 2-3 영업일이 소요됩니다."],
      payment: ["신용카드, 카카오페이, 네이버 페이, 계좌이체를 받습니다. 모든 결제는 Stripe를 통해 안전합니다."],
      stock: ["각 상품 카드에서 재고를 확인할 수 있습니다. 품절된 상품은 해당 표시가 됩니다."],
      discount: ["정기적으로 할인을 제공합니다! 독점 혜택과 세일 소식을 받아볼 수 있도록 뉴스레터를 구독하세요."],
      contact: ["lumitea.kr@gmail.com으로 문의하거나 +82 10 2187 3643으로 전화하세요. 텔레그램 @lumi_chai도 있습니다."],
      location: ["인천에 위치하고 있습니다. 주소: 인천 연수구 함박로12번길 14"],
      default: ["잘 이해하지 못했습니다. 다시 말씀해 주시겠어요?", "더 자세한 도움이 필요하시면 이메일을 남겨주시면 연락드리겠습니다!"]
    },
    ru: {
      greeting: ["Здравствуйте! Добро пожаловать в Lumi Tea! Чем могу помочь?", "Привет! Ищете премиальный корейский чай?"],
      price: ["Цены на чай варьируются от 7,500 до 35,000 вон в зависимости от типа. Полный каталог можно посмотреть в разделе Магазин!"],
      shipping: ["Бесплатная доставка при заказе от 50,000 вон по Южной Корее. Доставка обычно занимает 2-3 рабочих дня."],
      payment: ["Принимаем кредитные карты, KakaoPay, Naver Pay и банковские переводы. Все платежи безопасны через Stripe."],
      stock: ["Наличие можно проверить на карточке каждого товара. Если товара нет в наличии, это будет отмечено."],
      discount: ["Мы регулярно предлагаем скидки! Подпишитесь на нашу рассылку, чтобы получать эксклюзивные предложения и новости о распродажах."],
      contact: ["Свяжитесь с нами по адресу lumitea.kr@gmail.com или позвоните +82 10 2187 3643. Мы также в Telegram @lumi_chai"],
      location: ["Мы находимся в Инчхоне, Южная Корея. Адрес: Incheon Yeonsu-gu Hambak-ro 12beon-gil 14"],
      default: ["Я не совсем понял. Можете переформулировать?", "Для более подробной помощи, пожалуйста, оставьте свой email, и мы свяжемся с вами!"]
    }
  };

  const langResponses = responses[language];
  
  if (lowerMsg.match(/hello|hi|hey|안녕|привет/)) {
    return langResponses.greeting[Math.floor(Math.random() * langResponses.greeting.length)];
  }
  if (lowerMsg.match(/price|cost|how much|가격|얼마|цена|сколько/)) {
    return langResponses.price[0];
  }
  if (lowerMsg.match(/shipping|delivery|배송|доставка/)) {
    return langResponses.shipping[0];
  }
  if (lowerMsg.match(/payment|pay|결제|оплата/)) {
    return langResponses.payment[0];
  }
  if (lowerMsg.match(/stock|available|재고|наличие/)) {
    return langResponses.stock[0];
  }
  if (lowerMsg.match(/discount|sale|할인|скидка/)) {
    return langResponses.discount[0];
  }
  if (lowerMsg.match(/contact|email|phone|연락|전화|контакт/)) {
    return langResponses.contact[0];
  }
  if (lowerMsg.match(/location|address|where|주소|위치|адрес|где/)) {
    return langResponses.location[0];
  }
  
  return langResponses.default[Math.floor(Math.random() * langResponses.default.length)];
};

export function ChatWidget({ language }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [, setEmailSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      title: 'Lumi Tea Assistant',
      placeholder: 'Type your message...',
      send: 'Send',
      emailPlaceholder: 'Your email address...',
      emailSubmit: 'Send to Support',
      emailTitle: 'Leave your email',
      emailDesc: 'We\'ll send the conversation to our support team',
      needHelp: 'Need help? Chat with us!',
      typing: 'Typing...',
      emailSuccess: 'Thank you! Our team will contact you soon.'
    },
    ko: {
      title: '루미 티 도우미',
      placeholder: '메시지를 입력하세요...',
      send: '병내',
      emailPlaceholder: '이메일 주소...',
      emailSubmit: '지원팀에 병내',
      emailTitle: '이메일을 남겨주세요',
      emailDesc: '대화 내용을 지원팀에 병내드리겠습니다',
      needHelp: '도움이 필요하신가요? 채팅하세요!',
      typing: '입력 중...',
      emailSuccess: '감사합니다! 담당팀이 곧 연락드리겠습니다.'
    },
    ru: {
      title: 'Помощник Lumi Tea',
      placeholder: 'Введите сообщение...',
      send: 'Отправить',
      emailPlaceholder: 'Ваш email адрес...',
      emailSubmit: 'Отправить в поддержку',
      emailTitle: 'Оставьте свой email',
      emailDesc: 'Мы отправим переписку в службу поддержки',
      needHelp: 'Нужна помощь? Напишите нам!',
      typing: 'Печатает...',
      emailSuccess: 'Спасибо! Наша команда скоро свяжется с вами.'
    }
  };

  const t = translations[language];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = getAIResponse('hello', language);
      setMessages([{
        id: 'welcome',
        text: welcomeMsg,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(userMsg.text, language);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      
      // If AI gives default response, show email option after a few messages
      if (messages.length > 4 && !showEmailForm) {
        setTimeout(() => {
          const emailMsg: Message = {
            id: (Date.now() + 2).toString(),
            text: language === 'en' 
              ? "Would you like to leave your email so our team can assist you better?"
              : language === 'ko'
              ? "이메일을 남기시면 담당팀이 더 잘 도와드릴 수 있습니다."
              : "Хотите оставить email, чтобы наша команда могла лучше помочь?",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, emailMsg]);
        }, 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleEmailSubmit = async () => {
    if (!userEmail.trim()) return;
    
    // Send via API
    try {
      await api.sendChat(userEmail, messages, language);
      setEmailSent(true);
      
      const confirmMsg: Message = {
        id: Date.now().toString(),
        text: t.emailSuccess,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (error) {
      console.log('API not available, but email saved locally');
      // Save to localStorage as fallback
      const chatRequests = JSON.parse(localStorage.getItem('lumi_tea_chat_requests') || '[]');
      chatRequests.push({
        email: userEmail,
        messages,
        language,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('lumi_tea_chat_requests', JSON.stringify(chatRequests));
      
      setEmailSent(true);
      const confirmMsg: Message = {
        id: Date.now().toString(),
        text: t.emailSuccess,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMsg]);
    }
    
    setShowEmailForm(false);
    setUserEmail('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110"
        title={t.needHelp}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium">{t.title}</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                msg.isUser 
                  ? 'bg-pink-500 text-white rounded-br-md' 
                  : 'bg-gray-100 text-gray-700 rounded-bl-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-bl-md text-sm">
                {t.typing}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Email Form */}
        {showEmailForm ? (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">{t.emailTitle}</p>
            <p className="text-xs text-gray-500 mb-3">{t.emailDesc}</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="pl-9 text-sm"
                />
              </div>
              <Button 
                onClick={handleEmailSubmit}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <button 
              onClick={() => setShowEmailForm(false)}
              className="text-xs text-gray-500 mt-2 hover:text-pink-500"
            >
              {language === 'en' ? 'Cancel' : language === 'ko' ? '취소' : 'Отмена'}
            </button>
          </div>
        ) : (
          /* Input */
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={handleSend}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <button 
              onClick={() => setShowEmailForm(true)}
              className="text-xs text-gray-400 mt-2 hover:text-pink-500 flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              {language === 'en' ? 'Email this conversation' : language === 'ko' ? '이 대화를 이메일로 병내' : 'Отправить переписку на email'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
