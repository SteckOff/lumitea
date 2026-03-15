import { ArrowLeft, MapPin, Clock, Briefcase, Send, Heart, Coffee, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JobPosition {
  id: number;
  title: string;
  titleKo: string;
  titleRu: string;
  department: string;
  departmentKo: string;
  departmentRu: string;
  location: string;
  locationKo: string;
  locationRu: string;
  type: string;
  typeKo: string;
  typeRu: string;
  description: string;
  descriptionKo: string;
  descriptionRu: string;
  requirements: string[];
  requirementsKo: string[];
  requirementsRu: string[];
}

const jobPositions: JobPosition[] = [
  {
    id: 1,
    title: "Tea Sommelier",
    titleKo: "티 소믈리에",
    titleRu: "Чайный сомелье",
    department: "Product",
    departmentKo: "제품",
    departmentRu: "Продукт",
    location: "Incheon, Yeonsu-gu",
    locationKo: "인천, 연수구",
    locationRu: "Инчхон, Ёнсу-гу",
    type: "Full-time",
    typeKo: "정규직",
    typeRu: "Полная занятость",
    description: "Join our team as a Tea Sommelier and help curate our premium tea collection. You'll be responsible for tea tasting, quality control, and educating customers about Korean tea culture.",
    descriptionKo: "티 소믈리에로 우리 팀에 합류하여 프리미엄 차 컬렉션을 선별하세요. 차 시음, 품질 관리, 고객 교육에 대한 책임을 지게 됩니다.",
    descriptionRu: "Присоединяйтесь к нашей команде в качестве чайного сомелье и помогайте формировать нашу премиальную чайную коллекцию. Вы будете отвечать за дегустацию чая, контроль качества и обучение клиентов корейской чайной культуре.",
    requirements: [
      "Passion for tea and Korean culture",
      "Excellent communication skills",
      "Experience in customer service (preferred)",
      "Fluent in Korean, English is a plus"
    ],
    requirementsKo: [
      "차와 한국 문화에 대한 열정",
      "우수한 의사소통 능력",
      "고객 서비스 경험 (선호)",
      "한국어 유창, 영어 가능 우대"
    ],
    requirementsRu: [
      "Страсть к чаю и корейской культуре",
      "Отличные коммуникативные навыки",
      "Опыт в обслуживании клиентов (предпочтительно)",
      "Свободный корейский, английский — плюс"
    ]
  },
  {
    id: 2,
    title: "Digital Marketing Specialist",
    titleKo: "디지털 마케팅 전문가",
    titleRu: "Специалист по цифровому маркетингу",
    department: "Marketing",
    departmentKo: "마케팅",
    departmentRu: "Маркетинг",
    location: "Incheon, Yeonsu-gu",
    locationKo: "인천, 연수구",
    locationRu: "Инчхон, Ёнсу-гу",
    type: "Full-time",
    typeKo: "정규직",
    typeRu: "Полная занятость",
    description: "We're looking for a creative Digital Marketing Specialist to manage our social media presence, create engaging content, and grow our online community of tea lovers.",
    descriptionKo: "소셜 미디어 존재를 관리하고, 매력적인 콘텐츠를 만들고, 차 애호가들의 온라인 커뮤니티를 성장시킬 창의적인 디지털 마케팅 전문가를 찾고 있습니다.",
    descriptionRu: "Мы ищем творческого специалиста по цифровому маркетингу для управления нашим присутствием в социальных сетях, создания увлекательного контента и развития нашего онлайн-сообщества любителей чая.",
    requirements: [
      "2+ years experience in digital marketing",
      "Proficiency in Instagram, Facebook, TikTok",
      "Content creation and photography skills",
      "Knowledge of Korean tea culture is a plus"
    ],
    requirementsKo: [
      "디지털 마케팅 2년 이상 경험",
      "인스타그램, 페이스북, 틱톡 능숙",
      "콘텐츠 제작 및 사진 촬영 기술",
      "한국 차 문화 지식 우대"
    ],
    requirementsRu: [
      "2+ года опыта в цифровом маркетинге",
      "Владение Instagram, Facebook, TikTok",
      "Навыки создания контента и фотографии",
      "Знание корейской чайной культуры — плюс"
    ]
  },
  {
    id: 3,
    title: "Warehouse & Logistics Coordinator",
    titleKo: "물류 및 물류 코디네이터",
    titleRu: "Координатор склада и логистики",
    department: "Operations",
    departmentKo: "운영",
    departmentRu: "Операции",
    location: "Incheon, Yeonsu-gu",
    locationKo: "인천, 연수구",
    locationRu: "Инчхон, Ёнсу-гу",
    type: "Full-time",
    typeKo: "정규직",
    typeRu: "Полная занятость",
    description: "Manage our warehouse operations, inventory, and order fulfillment. Ensure that every tea order reaches our customers in perfect condition and on time.",
    descriptionKo: "물류 운영, 재고, 주문 이행을 관리하세요. 모든 차 주문이 완벽한 상태와 제시간에 고객에게 도달하도록 보장합니다.",
    descriptionRu: "Управляйте нашими складскими операциями, инвентарем и выполнением заказов. Обеспечьте, чтобы каждый заказ чая доходил до наших клиентов в идеальном состоянии и вовремя.",
    requirements: [
      "Experience in warehouse management",
      "Organized and detail-oriented",
      "Basic computer skills",
      "Valid Korean driver's license"
    ],
    requirementsKo: [
      "물류 관리 경험",
      "체계적이고 세부 지향적",
      "기본 컴퓨터 기술",
      "유효한 한국 운전면허증"
    ],
    requirementsRu: [
      "Опыт управления складом",
      "Организованность и внимание к деталям",
      "Базовые навыки работы с компьютером",
      "Действующие корейские водительские права"
    ]
  },
  {
    id: 4,
    title: "Customer Service Representative",
    titleKo: "고객 서비스 담당자",
    titleRu: "Представитель службы поддержки",
    department: "Customer Service",
    departmentKo: "고객 서비스",
    departmentRu: "Служба поддержки",
    location: "Remote / Incheon",
    locationKo: "재택 / 인천",
    locationRu: "Удаленно / Инчхон",
    type: "Part-time",
    typeKo: "파트타임",
    typeRu: "Частичная занятость",
    description: "Be the friendly voice of Lumi Tea! Help customers with orders, answer tea-related questions, and ensure every interaction leaves a positive impression.",
    descriptionKo: "루미 티의 친절한 목소리가 되세요! 주문을 도와주고, 차 관련 질문에 답하고, 모든 상호작용이 긍정적인 인상을 남기도록 보장합니다.",
    descriptionRu: "Будьте дружелюбным голосом Lumi Tea! Помогайте клиентам с заказами, отвечайте на вопросы о чае и обеспечивайте, чтобы каждое взаимодействие оставляло положительное впечатление.",
    requirements: [
      "Friendly and patient personality",
      "Good written and verbal communication",
      "Available weekends",
      "Multilingual is a plus (English, Russian)"
    ],
    requirementsKo: [
      "친절하고 인내심 있는 성격",
      "좋은 글쓰기 및 구두 의사소통",
      "주말 근무 가능",
      "다국어 가능 우대 (영어, 러시아어)"
    ],
    requirementsRu: [
      "Дружелюбный и терпеливый характер",
      "Хорошая письменная и устная коммуникация",
      "Доступность в выходные",
      "Мультиязычность — плюс (английский, русский)"
    ]
  }
];

interface CareersPageProps {
  language: 'en' | 'ko' | 'ru';
  onBack: () => void;
}

export function CareersPage({ language, onBack }: CareersPageProps) {
  const getLocalizedContent = (job: JobPosition) => {
    switch (language) {
      case 'ko':
        return {
          title: job.titleKo,
          department: job.departmentKo,
          location: job.locationKo,
          type: job.typeKo,
          description: job.descriptionKo,
          requirements: job.requirementsKo
        };
      case 'ru':
        return {
          title: job.titleRu,
          department: job.departmentRu,
          location: job.locationRu,
          type: job.typeRu,
          description: job.descriptionRu,
          requirements: job.requirementsRu
        };
      default:
        return {
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements
        };
    }
  };

  const translations = {
    en: {
      backToHome: 'Back to Home',
      joinTeam: 'Join the Lumi Tea Family',
      subtitle: 'Passionate about tea? We\'d love to hear from you.',
      whyJoin: 'Why Work With Us?',
      benefits: {
        tea: 'Free premium tea',
        flexible: 'Flexible hours',
        growth: 'Career growth',
        team: 'Great team'
      },
      openPositions: 'Open Positions',
      applyVia: 'Apply via Telegram',
      requirements: 'Requirements:',
      noPositions: 'No open positions at the moment.',
      checkLater: 'Please check back later or follow us on social media for updates.'
    },
    ko: {
      backToHome: '홈으로 돌아가기',
      joinTeam: '루미 티 가족에 합류하세요',
      subtitle: '차에 열정이 있으신가요? 연락을 기다리고 있습니다.',
      whyJoin: '왜 우리와 함께 일해야 하나요?',
      benefits: {
        tea: '프리미엄 차 물류',
        flexible: '유연한 시간',
        growth: '커리어 성장',
        team: '훌륭한 팀'
      },
      openPositions: '채용 중인 포지션',
      applyVia: '텔레그램으로 지원',
      requirements: '요구사항:',
      noPositions: '현재 채용 중인 포지션이 없습니다.',
      checkLater: '나중에 다시 확인하거나 소셜 미디어에서 업데이트를 팔로우하세요.'
    },
    ru: {
      backToHome: 'На главную',
      joinTeam: 'Присоединяйтесь к семье Lumi Tea',
      subtitle: 'Увлечены чаем? Мы будем рады услышать от вас.',
      whyJoin: 'Почему стоит работать с нами?',
      benefits: {
        tea: 'Бесплатный премиум чай',
        flexible: 'Гибкий график',
        growth: 'Карьерный рост',
        team: 'Отличная команда'
      },
      openPositions: 'Открытые вакансии',
      applyVia: 'Подать заявку через Telegram',
      requirements: 'Требования:',
      noPositions: 'В настоящее время нет открытых вакансий.',
      checkLater: 'Пожалуйста, проверьте позже или следите за нами в социальных сетях для обновлений.'
    }
  };

  const t = translations[language];
  const telegramBotUrl = "https://t.me/pomnomgx";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-pink-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToHome}
        </Button>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold gradient-text mb-4">
            {t.joinTeam}
          </h1>
          <p className="text-gray-600 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t.whyJoin}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-7 h-7 text-pink-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">{t.benefits.tea}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-7 h-7 text-pink-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">{t.benefits.flexible}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-pink-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">{t.benefits.growth}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-pink-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">{t.benefits.team}</p>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t.openPositions}
          </h2>

          {jobPositions.length > 0 ? (
            <div className="space-y-4">
              {jobPositions.map((job) => {
                const content = getLocalizedContent(job);
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {content.title}
                          </h3>
                          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                            {content.department}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {content.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {content.type}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {content.description}
                        </p>

                        <div className="mb-4">
                          <p className="font-medium text-gray-700 mb-2">
                            {t.requirements}
                          </p>
                          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                            {content.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <a
                        href={telegramBotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button className="btn-primary w-full md:w-auto">
                          <Send className="w-4 h-4 mr-2" />
                          {t.applyVia}
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {t.noPositions}
              </h3>
              <p className="text-gray-500">
                {t.checkLater}
              </p>
            </div>
          )}
        </div>

        {/* Telegram CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-center text-white">
          <Send className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">
            {language === 'en' 
              ? 'Apply via Telegram Bot'
              : language === 'ko'
              ? '텔레그램 봇으로 지원'
              : 'Подать заявку через Telegram бот'}
          </h3>
          <p className="mb-6 opacity-90">
            {language === 'en'
              ? 'Send your CV and cover letter to our HR bot'
              : language === 'ko'
              ? 'CV와 자기소개서를 HR 봇에게 별내주세요'
              : 'Отправьте свое резюме и сопроводительное письмо нашему HR-боту'}
          </p>
          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Send className="w-5 h-5 mr-2" />
              @pomnomgx
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
