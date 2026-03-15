import { useState } from 'react';
import { ArrowLeft, ChevronDown, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  id: number;
  question: string;
  questionKo: string;
  questionRu: string;
  answer: string;
  answerKo: string;
  answerRu: string;
  category: string;
  categoryKo: string;
  categoryRu: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is the best way to store tea?",
    questionKo: "차를 보관하는 가장 좋은 방법은 무엇인가요?",
    questionRu: "Как лучше всего хранить чай?",
    answer: "Store your tea in an airtight container away from light, heat, and moisture. Our glass jars with wooden lids are perfect for preserving freshness. Keep tea in a cool, dark place — never in the refrigerator as condensation can damage the leaves. Properly stored, our teas maintain their quality for up to 12 months.",
    answerKo: "차를 빛, 열, 습기로부터 멀리 떨어진 밀폐 용기에 보관하세요. 우리의 나무 뚜껑이 달린 유리 항아리는 신선도를 보존하기에 완벽합니다. 차를 서늘하고 어두운 곳에 보관하세요 — 결로가 잎을 손상시킬 수 있으므로 냉장고에 보관하지 마세요. 적절히 보관하면 우리 차는 최대 12개월 동안 품질을 유지합니다.",
    answerRu: "Храните чай в герметичном контейнере подальше от света, тепла и влаги. Наши стеклянные банки с деревянными крышками идеально подходят для сохранения свежести. Держите чай в прохладном, темном месте — никогда не в холодильнике, так как конденсация может повредить листья. При правильном хранении наши чаи сохраняют свое качество до 12 месяцев.",
    category: "Storage",
    categoryKo: "보관",
    categoryRu: "Хранение"
  },
  {
    id: 2,
    question: "How do I brew the perfect cup of oolong tea?",
    questionKo: "완벽한 우롱차 한 잔을 우려낼 수 있나요?",
    questionRu: "Как заварить идеальную чашку улун?",
    answer: "For oolong tea, use water at 85-90°C (185-194°F). Use 3g of tea per 200ml of water. First, rinse the leaves with hot water for 5 seconds and discard. Then steep for 30-60 seconds for the first infusion. Oolong can be re-steeped 3-5 times, with each infusion revealing new layers of flavor. Increase steeping time by 15 seconds for each subsequent infusion.",
    answerKo: "우롱차의 경우 85-90°C(185-194°F)의 물을 사용하세요. 200ml 물에 차 3g을 사용하세요. 먼저, 뜨거운 물로 잎을 5초간 헹구고 버리세요. 그런 다음 첫 우림을 위해 30-60초 동안 우려내세요. 우롱은 3-5번 다시 우려낼 수 있으며, 각 우림마다 새로운 맛의 레이어가 드러납니다. 후속 우림마다 우림 시간을 15초씩 늘리세요.",
    answerRu: "Для улун используйте воду при температуре 85-90°C. Используйте 3г чая на 200мл воды. Сначала промойте листья горячей водой в течение 5 секунд и слейте. Затем настаивайте 30-60 секунд для первого заваривания. Улун можно заваривать повторно 3-5 раз, причем каждое заваривание открывает новые слои вкуса. Увеличивайте время заваривания на 15 секунд для каждого последующего заваривания.",
    category: "Brewing",
    categoryKo: "우림",
    categoryRu: "Заваривание"
  },
  {
    id: 3,
    question: "What are your shipping options and delivery times?",
    questionKo: "배송 옵션과 배송 시간은 어떻게 되나요?",
    questionRu: "Какие у вас варианты доставки и сроки?",
    answer: "We offer free standard shipping on orders over 50,000 KRW within South Korea. Standard delivery takes 2-3 business days. Express shipping (1-2 business days) is available for 5,000 KRW. For international shipping, please contact us for rates and availability. All orders are shipped via CJ Logistics or Korea Post with tracking provided.",
    answerKo: "한국 내에서 50,000원 이상 주문 시 물류비 물류가 제공됩니다. 표준 배송은 2-3 영업일이 소요됩니다. 익스프레스 배송(1-2 영업일)은 5,000원에 이용 가능합니다. 국제 배송의 경우 요금과 가용성을 위해 문의해 주세요. 모든 주문은 CJ대한통운 또는 우체국을 통해 발송되며 추적이 제공됩니다.",
    answerRu: "Мы предлагаем бесплатную стандартную доставку при заказе свыше 50 000 вон в пределах Южной Кореи. Стандартная доставка занимает 2-3 рабочих дня. Экспресс-доставка (1-2 рабочих дня) доступна за 5 000 вон. Для международной доставки, пожалуйста, свяжитесь с нами для уточнения тарифов и доступности. Все заказы отправляются через CJ Logistics или Korea Post с предоставлением трек-номера.",
    category: "Shipping",
    categoryKo: "배송",
    categoryRu: "Доставка"
  },
  {
    id: 4,
    question: "Can I return or exchange my order?",
    questionKo: "주문을 반품하거나 교환할 수 있나요?",
    questionRu: "Могу ли я вернуть или обменять заказ?",
    answer: "Yes, we accept returns within 14 days of delivery for unopened products in their original packaging. For quality issues, we offer full refunds or exchanges within 30 days. Please contact our customer service team at hello@lumitea.kr or call +82 10 2187 3643 to initiate a return. Note that shipping costs for returns are the customer's responsibility unless the product is defective.",
    answerKo: "네, 원래 포장에 개봉되지 않은 제품은 배송 후 14일 이내에 반품을 받습니다. 품질 문제의 경우, 30일 이내에 전액 환불 또는 교환을 제공합니다. 반품을 시작하려면 고객 서비스 팀에 hello@lumitea.kr로 문의하거나 +82 10 2187 3643으로 전화하세요. 제품에 결함이 없는 한 반품 배송 비용은 고객의 책임임을 참고하세요.",
    answerRu: "Да, мы принимаем возвраты в течение 14 дней с момента доставки для неоткрытых продуктов в оригинальной упаковке. По вопросам качества мы предлагаем полный возврат средств или обмен в течение 30 дней. Пожалуйста, свяжитесь с нашей службой поддержки по адресу hello@lumitea.kr или позвоните +82 10 2187 3643, чтобы инициировать возврат. Обратите внимание, что стоимость доставки при возврате оплачивается клиентом, если только продукт не является дефектным.",
    category: "Returns",
    categoryKo: "반품",
    categoryRu: "Возвраты"
  },
  {
    id: 5,
    question: "Do you offer wholesale or bulk pricing?",
    questionKo: "도매 또는 대량 구매 가격을 제공하나요?",
    questionRu: "Предлагаете ли вы оптовые цены или цены на крупные заказы?",
    answer: "Yes! We offer wholesale pricing for businesses, cafes, and hotels. Minimum order quantity is 5kg per tea type. Contact us at wholesale@lumitea.kr for a custom quote. We also offer corporate gift packages with custom branding options for orders of 20+ sets.",
    answerKo: "네! 우리는 기업, 카페, 호텔을 위한 도매 가격을 제공합니다. 최소 주문 수량은 차 종류당 5kg입니다. 맞춤 견적을 위해 wholesale@lumitea.kr로 문의하세요. 또한 20세트 이상 주문에 대해 맞춤 브랜딩 옵션이 있는 기업용 선물 패키지를 제공합니다.",
    answerRu: "Да! Мы предлагаем оптовые цены для бизнеса, кафе и отелей. Минимальный заказ — 5кг на тип чая. Свяжитесь с нами по адресу wholesale@lumitea.kr для получения индивидуального предложения. Мы также предлагаем корпоративные подарочные пакеты с возможностью нанесения брендинга для заказов от 20+ наборов.",
    category: "Business",
    categoryKo: "비즈니스",
    categoryRu: "Бизнес"
  },
  {
    id: 6,
    question: "Is your tea organic?",
    questionKo: "차가 유기농인가요?",
    questionRu: "Ваш чай органический?",
    answer: "Many of our teas are certified organic, including our Bai Hao Yin Zhen (Silver Needle) and Hainan Green. All our teas are sourced from farms that follow sustainable and ethical practices. We test every batch for pesticides and heavy metals to ensure the highest quality and safety standards. Look for the 'Organic' tag on product pages for certified organic options.",
    answerKo: "우리 차의 많은 것들이 인증된 유기농입니다. 바이하오 인전(실버 니들)과 하이난 그린을 포함하여. 모든 차는 지속 가능하고 윤리적인 관행을 따르는 농장에서 공급됩니다. 우리는 최고의 품질과 안전 기준을 보장하기 위해 모든 배치에 대해 살충제와 중금속을 테스트합니다. 인증된 유기농 옵션을 위해 제품 페이지의 '유기농' 태그를 찾아보세요.",
    answerRu: "Многие из наших чаев имеют органический сертификат, включая наш Бай Хао Инь Чжэнь (Серебряные Иглы) и Хайнаньский Зеленый. Все наши чаи поступают с ферм, соблюдающих устойчивые и этичные практики. Мы тестируем каждую партию на пестициды и тяжелые металлы, чтобы гарантировать высочайшие стандарты качества и безопасности. Ищите тег 'Органический' на страницах продуктов для сертифицированных органических вариантов.",
    category: "Products",
    categoryKo: "제품",
    categoryRu: "Продукты"
  },
  {
    id: 7,
    question: "What payment methods do you accept?",
    questionKo: "어떤 결제 방법을 받나요?",
    questionRu: "Какие способы оплаты вы принимаете?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), Korean debit cards, KakaoPay, Naver Pay, and bank transfers. All payments are processed securely through Stripe with SSL encryption. For corporate orders, we also accept invoice payments with NET 30 terms for approved accounts.",
    answerKo: "모든 주요 신용카드(비자, 마스터카드, 아메리칸 익스프레스), 한국 직불카드, 카카오페이, 네이버 페이, 계좌이체를 받습니다. 모든 결제는 SSL 암호화를 통해 Stripe에서 안전하게 처리됩니다. 기업 주문의 경우 승인된 계정에 대해 NET 30 조건의 인보이스 결제도 받습니다.",
    answerRu: "Мы принимаем все основные кредитные карты (Visa, Mastercard, American Express), корейские дебетовые карты, KakaoPay, Naver Pay и банковские переводы. Все платежи обрабатываются безопасно через Stripe с SSL-шифрованием. Для корпоративных заказов мы также принимаем оплату по счетам с условиями NET 30 для одобренных аккаунтов.",
    category: "Payment",
    categoryKo: "결제",
    categoryRu: "Оплата"
  },
  {
    id: 8,
    question: "How much caffeine is in your teas?",
    questionKo: "차에 카페인이 얼마나 들어있나요?",
    questionRu: "Сколько кофеина в ваших чаях?",
    answer: "Caffeine content varies by tea type: White tea (15-30mg/cup), Green tea (20-35mg/cup), Oolong (30-50mg/cup), Black tea (40-70mg/cup). For caffeine-free options, try our Buckwheat Tea, Fruit Tea, or Lemongrass. Pregnant women and those sensitive to caffeine should consult their healthcare provider before consuming caffeinated teas.",
    answerKo: "카페인 함량은 차 종류에 따라 다릅니다: 백차(컵당 15-30mg), 녹차(컵당 20-35mg), 우롱(컵당 30-50mg), 홍차(컵당 40-70mg). 카페인 프리 옵션의 경우, 우리의 메밀차, 과일 차, 또는 레몬그라스를 시도해 보세요. 임산부와 카페인에 민감한 사람들은 카페인이 있는 차를 마시기 전에 의료 제공자와 상담해야 합니다.",
    answerRu: "Содержание кофеина варьируется в зависимости от типа чая: Белый чай (15-30мг/чашка), Зеленый чай (20-35мг/чашка), Улун (30-50мг/чашка), Черный чай (40-70мг/чашка). Для вариантов без кофеина попробуйте наш Гречишный чай, Фруктовый чай или Лемонграсс. Беременным женщинам и людям, чувствительным к кофеину, следует проконсультироваться с врачом перед употреблением чаев с кофеином.",
    category: "Products",
    categoryKo: "제품",
    categoryRu: "Продукты"
  },
  {
    id: 9,
    question: "Do you offer gift wrapping?",
    questionKo: "선물 포장을 제공하나요?",
    questionRu: "Предлагаете ли вы подарочную упаковку?",
    answer: "Yes! All our gift sets come in elegant packaging perfect for any occasion. For individual tea orders, we offer premium gift wrapping for an additional 3,000 KRW. You can also include a personalized message card at no extra cost. During checkout, simply select the 'Gift Wrap' option and add your message.",
    answerKo: "네! 모든 선물 세트는 어떤 경우에도 완벽한 우아한 포장으로 제공됩니다. 개별 차 주문의 경우, 추가 3,000원에 프리미엄 선물 포장을 제공합니다. 추가 비용 없이 개인화된 메시지 카드를 포함할 수도 있습니다. 결제 시, 간단히 '선물 포장' 옵션을 선택하고 메시지를 추가하세요.",
    answerRu: "Да! Все наши подарочные наборы поставляются в элегантной упаковке, идеальной для любого случая. Для индивидуальных заказов чая мы предлагаем премиальную подарочную упаковку за дополнительные 3 000 вон. Вы также можете включить персонализированную поздравительную карточку без дополнительной платы. При оформлении заказа просто выберите опцию 'Подарочная упаковка' и добавьте свое сообщение.",
    category: "Gifts",
    categoryKo: "선물",
    categoryRu: "Подарки"
  },
  {
    id: 10,
    question: "How can I track my order?",
    questionKo: "주문을 어떻게 추적할 수 있나요?",
    questionRu: "Как я могу отследить свой заказ?",
    answer: "Once your order ships, you'll receive an email with a tracking number. You can also track your order by logging into your account and viewing your order history. For any shipping inquiries, contact us at hello@lumitea.kr or call +82 10 2187 3643. Our customer service team is available Monday-Friday, 9 AM - 6 PM KST.",
    answerKo: "주문이 발송되면 추적 번호가 포함된 이메일을 받게 됩니다. 계정에 로그인하여 주문 내역을 보는 것으로도 주문을 추적할 수 있습니다. 배송 문의의 경우, hello@lumitea.kr로 문의하거나 +82 10 2187 3643으로 전화하세요. 우리 고객 서비스 팀은 월요일-금요일, 오전 9시 - 오후 6시 KST에 이용 가능합니다.",
    answerRu: "После отправки заказа вы получите электронное письмо с трек-номером. Вы также можете отслеживать свой заказ, войдя в свой аккаунт и просмотрев историю заказов. По любым вопросам доставки свяжитесь с нами по адресу hello@lumitea.kr или позвоните +82 10 2187 3643. Наша служба поддержки доступна с понедельника по пятницу, с 9:00 до 18:00 по корейскому времени.",
    category: "Shipping",
    categoryKo: "배송",
    categoryRu: "Доставка"
  }
];

interface FAQPageProps {
  language: 'en' | 'ko' | 'ru';
  onBack: () => void;
}

export function FAQPage({ language, onBack }: FAQPageProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getLocalizedContent = (item: FAQItem) => {
    switch (language) {
      case 'ko':
        return {
          question: item.questionKo,
          answer: item.answerKo,
          category: item.categoryKo
        };
      case 'ru':
        return {
          question: item.questionRu,
          answer: item.answerRu,
          category: item.categoryRu
        };
      default:
        return {
          question: item.question,
          answer: item.answer,
          category: item.category
        };
    }
  };

  const translations = {
    en: {
      backToHome: 'Back to Home',
      faq: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about our teas, shipping, and more.',
      search: 'Search questions...',
      allCategories: 'All Categories',
      stillHaveQuestions: 'Still have questions?',
      contactUs: 'Contact us directly and we\'ll be happy to help!',
      contactButton: 'Contact Us'
    },
    ko: {
      backToHome: '홈으로 돌아가기',
      faq: '자주 묻는 질문',
      subtitle: '차, 배송 등에 대한 일반적인 질문에 대한 답변을 찾아보세요.',
      search: '질문 검색...',
      allCategories: '모든 카테고리',
      stillHaveQuestions: '여전히 질문이 있으신가요?',
      contactUs: '직접 문의해 주시면 기꺼이 도와드리겠습니다!',
      contactButton: '문의하기'
    },
    ru: {
      backToHome: 'На главную',
      faq: 'Часто задаваемые вопросы',
      subtitle: 'Найдите ответы на распространенные вопросы о наших чаях, доставке и многом другом.',
      search: 'Поиск вопросов...',
      allCategories: 'Все категории',
      stillHaveQuestions: 'Остались вопросы?',
      contactUs: 'Свяжитесь с нами напрямую, и мы будем рады помочь!',
      contactButton: 'Связаться'
    }
  };

  const t = translations[language];

  // Get unique categories
  const categories = [...new Set(faqData.map(item => getLocalizedContent(item).category))];

  // Filter FAQ items
  const filteredFAQs = faqData.filter(item => {
    const content = getLocalizedContent(item);
    const matchesSearch = content.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? content.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-pink-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToHome}
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
            {t.faq}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 hover:bg-pink-100 border border-gray-200'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-pink-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map((item) => {
            const content = getLocalizedContent(item);
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 pr-4">
                    {content.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {content.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {language === 'en' 
              ? 'No questions found matching your search.'
              : language === 'ko'
              ? '검색과 일치하는 질문을 찾을 수 없습니다.'
              : 'Вопросы, соответствующие вашему поиску, не найдены.'}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-pink-100 to-pink-200 rounded-2xl p-8 text-center">
          <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {t.stillHaveQuestions}
          </h3>
          <p className="text-gray-600 mb-4">
            {t.contactUs}
          </p>
          <Button 
            onClick={onBack}
            className="btn-primary"
          >
            {t.contactButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
