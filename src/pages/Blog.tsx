import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: number;
  title: string;
  titleKo: string;
  titleRu: string;
  excerpt: string;
  excerptKo: string;
  excerptRu: string;
  content: string;
  contentKo: string;
  contentRu: string;
  date: string;
  readTime: string;
  category: string;
  categoryKo: string;
  categoryRu: string;
  image: string;
  author: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Art of Korean Tea Ceremony: A Journey Through Tradition",
    titleKo: "한국 다도의 예술: 전통을 통한 여정",
    titleRu: "Искусство корейской чайной церемонии: Путешествие через традиции",
    excerpt: "Discover the ancient wisdom and mindfulness practices behind Korea's traditional tea culture, from the mountains of Boseong to modern Seoul.",
    excerptKo: "보성의 산에서 현대 서울까지 한국의 전통 차 문화 뒤에 있는 고대의 지혜와 마음챙김 실천을 발견하세요.",
    excerptRu: "Откройте для себя древнюю мудрость и практики осознанности, стоящие за традиционной чайной культурой Кореи, от гор Босон до современного Сеула.",
    content: `Korean tea culture dates back over a thousand years, deeply intertwined with Buddhism and the pursuit of spiritual enlightenment. The Korean tea ceremony, known as 'Darye' (다례), emphasizes harmony, respect, and mindfulness in every gesture.

The most famous Korean tea-growing region is Boseong in South Jeolla Province, where terraced green tea fields create breathtaking landscapes. Here, farmers still harvest tea leaves by hand, following methods passed down through generations.

What makes Korean tea unique is the emphasis on natural processing. Unlike heavily fermented teas, Korean green teas like 'Sejak' and 'Ujeon' are minimally processed to preserve their fresh, vegetal flavors and high antioxidant content.

At Lumi Tea, we source our premium oolongs and green teas directly from these historic regions, ensuring every cup carries the essence of Korean heritage. Our Milk Oolong, for example, is crafted using traditional partial oxidation techniques that create its signature creamy texture without any artificial additives.

Whether you're a seasoned tea connoisseur or just beginning your journey, understanding the cultural context enriches every sip. We invite you to slow down, brew a cup of our finest tea, and experience a moment of tranquility inspired by centuries of tradition.`,
    contentKo: `한국의 차 문화는 천 년 이상의 역사를 가지고 있으며, 불교와 영적 깨달음의 추구와 깊이 얽혀 있습니다. '다례'라고 알려진 한국의 차 의식은 모든 제스처에서 조화, 존중, 마음챙김을 강조합니다.

가장 유명한 한국 차 재배 지역은 전라남도 보성으로, 계단식 녹차 밭이 숨 막히는 풍경을 만들어냅니다. 이곳에서 농부들은 대대로 전해 날아온 방법을 따라 여전히 손으로 차 잎을 수확합니다.

한국 차를 독특하게 만드는 것은 자연 가공에 대한 강조입니다. 무겁게 발효된 차와 달리, '세작'과 '우전'과 같은 한국 녹차는 신선한 채소 맛과 높은 항산화 함량을 보존하기 위해 최소한으로 가공됩니다.

루미 티에서 우리는 프리미엄 우롱과 녹차를 이러한 역사적인 지역에서 직접 공급받아, 매 컵이 한국 유산의 정수를 담고 있도록 합니다. 예를 들어, 우리의 밀크 우롱은 인공 첨가물 없이 그 특징적인 크리미한 질감을 만들어내는 전통적인 부분 산화 기법을 사용하여 제작됩니다.

숙련된 차 감정가이든 여정을 막 시작한 사람이든, 문화적 맥락을 이해하는 것은 매 순간을 풍요롭게 합니다. 여러분이 느긋하게 앉아, 우리의 최고 품질 차를 한 잔 우려내고, 수세기의 전통에서 영감을 받은 평온한 순간을 경험하기를 초대합니다.`,
    contentRu: `Корейская чайная культура насчитывает более тысячи лет, глубоко переплетенная с буддизмом и стремлением к духовному просветлению. Корейская чайная церемония, известная как 'Даре' (다례), подчеркивает гармонию, уважение и осознанность в каждом жесте.

Самый известный чайный регион Кореи — Босон в провинции Чолла-Намдо, где террасные чайные плантации создают захватывающие дух пейзажи. Здесь фермеры до сих пор собирают чайные листья вручную, следуя методам, передаваемым из поколения в поколение.

Что делает корейский чай уникальным, так это акцент на натуральной обработке. В отличие от сильно ферментированных чаев, корейские зеленые чаи, такие как 'Седжак' и 'Уджон', подвергаются минимальной обработке, чтобы сохранить их свежий, овощной вкус и высокое содержание антиоксидантов.

В Lumi Tea мы закупаем наши премиальные улуны и зеленые чаи напрямую из этих исторических регионов, гарантируя, что каждая чашка несет в себе сущность корейского наследия. Наш Молочный Улун, например, изготавливается с использованием традиционных техник частичной окисления, которые создают его фирменную кремовую текстуру без каких-либо искусственных добавок.

Будь вы опытным ценителем чая или только начинаете свой путь, понимание культурного контекста обогащает каждый глоток. Мы приглашаем вас расслабиться, заварить чашку нашего лучшего чая и испытать момент спокойствия, вдохновленный веками традиций.`,
    date: "2026-03-05",
    readTime: "5 min",
    category: "Culture",
    categoryKo: "문화",
    categoryRu: "Культура",
    image: "/tea_collection.jpg",
    author: "Lumi Tea Team"
  },
  {
    id: 2,
    title: "Health Benefits of Oolong Tea: Science Meets Tradition",
    titleKo: "우롱차의 건강 이점: 과학이 전통을 만나다",
    titleRu: "Польза улун для здоровья: Наука встречается с традицией",
    excerpt: "Modern research confirms what tea masters have known for centuries - oolong tea offers remarkable benefits for metabolism, heart health, and mental clarity.",
    excerptKo: "현대 연구는 차 마스터들이 수세기 동안 알고 있었던 것을 확인합니다 - 우롱차는 신진대사, 심장 건강, 정신 명료성에 놀라운 이점을 제공합니다.",
    excerptRu: "Современные исследования подтверждают то, что мастера чая знали на протяжении веков — улун обеспечивает замечательные преимущества для метаболизма, здоровья сердца и ясности ума.",
    content: `Oolong tea, with its unique position between green and black tea, offers a remarkable combination of health benefits backed by modern scientific research.

Metabolism Boost: Studies published in the Journal of Nutrition have shown that oolong tea can increase energy expenditure by up to 10% after consumption. This makes it an excellent companion for those looking to maintain a healthy weight. Our Ginseng Oolong combines this metabolic benefit with the energizing properties of Korean ginseng.

Heart Health: Regular consumption of oolong tea has been linked to reduced cholesterol levels and improved cardiovascular health. The polyphenols in oolong help prevent the oxidation of LDL cholesterol, a key factor in heart disease prevention.

Mental Clarity: The moderate caffeine content in oolong (less than coffee but more than green tea) combined with L-theanine creates a state of calm alertness. This is why many of our customers, especially IT professionals, choose our Tie Guan Yin or Classic Black as their afternoon focus tea.

Antioxidant Power: Oolong is rich in catechins and theaflavins, powerful antioxidants that combat free radicals and support overall cellular health. Our premium Dian Hong, with its golden tips, contains particularly high levels of these beneficial compounds.

At Lumi Tea, we're committed to sourcing teas that not only taste exceptional but also support your wellbeing. Each of our oolongs is carefully selected for both flavor profile and health properties, ensuring you get the best of both worlds in every cup.`,
    contentKo: `녹차와 홍차 사이의 독특한 위치를 가진 우롱차는 현대 과학 연구에 뒷받침되는 놀라운 건강 이점의 조합을 제공합니다.

신진대사 부스트: 영양학 저널에 발표된 연구에 따른 우롱차는 섭취 후 에너지 소비를 최대 10%까지 증가시킬 수 있습니다. 이는 건강한 체중을 유지하려는 사람들에게 훌륭한 동반자가 됩니다. 우리의 인삼 우롱은 이러한 신진대사 이점을 한국 인삼의 에너지 부여 특성과 결합합니다.

심장 건강: 우롱차의 규칙적인 섭취는 콜레스테롤 수치 감소와 심혈관 건강 개선과 연관되어 있습니다. 우롱의 폴리페놀은 심장병 예방의 핵심 요인인 LDL 콜레스테롤의 산화를 방지하는 데 도움이 됩니다.

정신 명료성: 우롱의 적당한 카페인 함량(커피보다는 적지만 녹차보다는 많음)이 L-테아닌과 결합하여 차분한 명료성 상태를 만듭니다. 이것이 바로 많은 고객, 특히 IT 전문가들이 오후 집중 차로 우리의 철관음이나 클래식 블랙을 선택하는 이유입니다.

항산화력: 우롱은 카테킨과 테아플라빈이 풍부하여, 자유 라디칼과 싸우고 전반적인 세포 건강을 지원하는 강력한 항산화제입니다. 골든 팁을 가진 우리의 프리미엄 뎬홍은 이러한 유익한 화합물이 특히 높은 수준을 포함하고 있습니다.

루미 티에서 우리는 맛이 뛰어날 뿐만 아니라 웰빙을 지원하는 차를 공급하는 데 전념하고 있습니다. 우리의 각 우롱은 맛 프로필과 건강 특성 모두를 위해 신중하게 선택되어, 매 컵마다 양쪽 세계의 최고를 얻을 수 있도록 합니다.`,
    contentRu: `Улун, занимающий уникальное положение между зеленым и черным чаем, предлагает замечательное сочетание преимуществ для здоровья, подтвержденных современными научными исследованиями.

Ускорение метаболизма: Исследования, опубликованные в Journal of Nutrition, показали, что улун может увеличить энергетические затраты до 10% после употребления. Это делает его отличным спутником для тех, кто стремится поддерживать здоровый вес. Наш Женьшеневый Улун сочетает это метаболическое преимущество с тонизирующими свойствами корейского женьшеня.

Здоровье сердца: Регулярное употребление улун связано с снижением уровня холестерина и улучшением сердечно-сосудистого здоровья. Полифенолы в улун помогают предотвратить окисление LDL-холестерина, ключевой фактор в профилактике сердечных заболеваний.

Ясность ума: Умеренное содержание кофеина в улуне (меньше, чем в кофе, но больше, чем в зеленом чае) в сочетании с L-теанином создает состояние спокойной бдительности. Вот почему многие наши клиенты, особенно ИТ-специалисты, выбирают наш Те Гуань Инь или Классический Черный как свой послеобеденный чай для концентрации.

Антиоксидантная мощь: Улун богат катехинами и теафлавинами, мощными антиоксидантами, которые борются со свободными радикалами и поддерживают общее здоровье клеток. Наш премиальный Дянь Хун с золотыми типсами содержит особенно высокие уровни этих полезных соединений.

В Lumi Tea мы стремимся поставлять чаи, которые не только исключительно вкусны, но и поддерживают ваше благополучие. Каждый из наших улуна тщательно отбирается как по вкусовому профилю, так и по полезным свойствам, гарантируя, что вы получаете лучшее из обоих миров в каждой чашке.`,
    date: "2026-02-28",
    readTime: "4 min",
    category: "Health",
    categoryKo: "건강",
    categoryRu: "Здоровье",
    image: "/tea_collection.jpg",
    author: "Dr. Kim, Tea Research Institute"
  },
  {
    id: 3,
    title: "Spring Tea Harvest 2026: First Flush Arrives at Lumi Tea",
    titleKo: "2026년 봄 차 수확: 첫물 차가 루미 티에 도착했습니다",
    titleRu: "Весенний чайный урожай 2026: Первый сбор прибыл в Lumi Tea",
    excerpt: "Experience the delicate flavors of spring with our first flush teas. Learn what makes this seasonal harvest so special and why tea enthusiasts eagerly await it.",
    excerptKo: "첫물 차의 섬세한 맛으로 봄을 경험하세요. 이 계절별 수확을 특별하게 만드는 것과 차 애호가들이 왜 이를 열정적으로 기다리는지 알아보세요.",
    excerptRu: "Испытайте нежные вкусы весны с нашими чаями первого сбора. Узнайте, что делает этот сезонный урожай таким особенным и почему ценители чая с нетерпением ждут его.",
    content: `Spring has arrived in Korea's tea-growing regions, and with it comes one of the most anticipated events in the tea calendar — the first flush harvest.

What is First Flush? First flush refers to the very first picking of tea leaves in spring, typically occurring between late March and early April. These young, tender leaves have been storing nutrients throughout winter, resulting in a tea that is exceptionally delicate, sweet, and complex.

This year, our tea masters in Boseong report ideal conditions — a mild winter followed by gentle spring rains. The result is what many are calling one of the best harvests in recent memory. Our 2026 Sejak (premium green tea) and Ujeon (pre-rain harvest) showcase bright, fresh flavors with notes of chestnut and spring grass.

Limited Availability: First flush teas are produced in small quantities and are highly sought after by collectors and enthusiasts worldwide. At Lumi Tea, we've secured a limited supply of these exceptional teas, available exclusively to our customers.

New Arrivals: Along with our first flush greens, we're excited to introduce two new additions to our collection — Aleyushiy Vostok, a lychee-infused black tea with floral undertones, and Lemongrass wellness tea, perfect for spring detox and refreshment.

Gift Set Update: To celebrate the season, we've also refreshed our gift set collection. Our new Assorted Flavors Tea Set, Chinese Tea Assortment, and Flower Collection Gift Set are now available, featuring the finest selections from this spring's harvest.

Order now to experience the taste of spring — these limited-edition teas won't be available for long!`,
    contentKo: `한국의 차 재배 지역에 봄이 왔고, 이와 함께 차 달력에서 가장 기대되는 이벤트 중 하나인 첫물 수확이 왔습니다.

첫물이란? 첫물은 일반적으로 3월 말에서 4월 초 사이에 발생하는 봄의 첫 차 잎 채취를 의미합니다. 이 어린, 부드러운 잎들은 겨울 날 낂 영양분을 저장해 왔으며, 이는 예외적으로 섬세하고 달콤하며 복잡한 차를 만듭니다.

올해 보성의 차 마스터들은 이상적인 조건을 보고했습니다 — 온화한 겨울 다음에 부드러운 봄비가 왔습니다. 그 결과 많은 사람들이 최근 기억 중 최고의 수확 중 하나라고 부르는 것이 만들어졌습니다. 우리의 2026 세작(프리미엄 녹차)과 우전(비 오기 전 수확)은 밤나무와 봄 풀 향이 나는 밝고 신선한 맛을 선보입니다.

한정된 가용성: 첫물 차는 소량으로 생산되며 전 세계의 수집가와 애호가들에게 높은 수요를 받고 있습니다. 루미 티에서 우리는 이러한 특별한 차의 한정된 공급을 확보했으며, 오직 우리 고객에게만 제공됩니다.

새로운 도착: 첫물 녹차와 함께, 우리는 우리 컬렉션에 두 가지 새로운 추가를 소개하게 되어兴奋합니다 — 플로럴 언더톤이 있는 리치 향 블랙 티 '아레이우시 보스토크'와 봄 디톡스와 리프레시먼트에 완벽한 레몬그라스 웰니스 티.

선물 세트 업데이트: 계절을 축하하기 위해, 우리는 또한 선물 세트 컬렉션을 새로 고쳤습니다. 우리의 새로운 아소티드 플레이버스 티 세트, 차이나 티 어소트먼트, 플라워 컬렉션 기프트 세트가 이제 제공되며, 이번 봄 수확의 최고 선택을 특징으로 합니다.

지금 주문하여 봄의 맛을 경험하세요 — 이 한정판 차들은 오래 동안 제공되지 않을 것입니다!`,
    contentRu: `Весна пришла в чайные регионы Кореи, и с ней приходит одно из самых ожидаемых событий в чайном календаре — первый весенний сбор.

Что такое Первый Сбор? Первый сбор относится к самому первому сбору чайных листьев весной, обычно происходящему между концом марта и началом апреля. Эти молодые, нежные листья накапливали питательные вещества в течение зимы, в результате чего получается чай, который исключительно нежен, сладок и сложен.

В этом году наши чайные мастера в Босоне сообщают об идеальных условиях — мягкая зима, за которой последовали нежные весенние дожди. Результат — то, что многие называют одним из лучших урожаев в недавней памяти. Наши Седжак (премиальный зеленый чай) и Уджон (урожай до дождей) 2026 года демонстрируют яркие, свежие вкусы с нотами каштана и весенней травы.

Ограниченная доступность: Чаи первого сбора производятся в небольших количествах и пользуются большим спросом у коллекционеров и ценителей по всему миру. В Lumi Tea мы обеспечили ограниченную поставку этих исключительных чаев, доступных исключительно для наших клиентов.

Новые поступления: Наряду с нашими зелеными чаями первого сбора, мы рады представить два новых дополнения к нашей коллекции — Алеющий Восток, черный чай с ароматом личи и цветочными оттенками, и чай для здоровья из лемонграсса, идеальный для весеннего детокса и освежения.

Обновление подарочных наборов: Чтобы отпраздновать сезон, мы также обновили нашу коллекцию подарочных наборов. Наши новые наборы 'Ассорти вкусов', 'Ассорти китайского чая' и 'Цветочная коллекция' теперь доступны, представляя лучшие подборки из весеннего урожая этого года.

Закажите сейчас, чтобы испытать вкус весны — эти ограниченные серии не будут доступны долго!`,
    date: "2026-03-01",
    readTime: "6 min",
    category: "News",
    categoryKo: "뉴스",
    categoryRu: "Новости",
    image: "/tea_collection.jpg",
    author: "Lumi Tea Team"
  }
];

interface BlogPageProps {
  language: 'en' | 'ko' | 'ru';
  onBack: () => void;
}

export function BlogPage({ language, onBack }: BlogPageProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const getLocalizedContent = (post: BlogPost) => {
    switch (language) {
      case 'ko':
        return {
          title: post.titleKo,
          excerpt: post.excerptKo,
          content: post.contentKo,
          category: post.categoryKo
        };
      case 'ru':
        return {
          title: post.titleRu,
          excerpt: post.excerptRu,
          content: post.contentRu,
          category: post.categoryRu
        };
      default:
        return {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category
        };
    }
  };

  const translations = {
    en: {
      back: 'Back to Blog',
      backToHome: 'Back to Home',
      readMore: 'Read More',
      latestNews: 'Latest News',
      by: 'By',
      minRead: 'min read'
    },
    ko: {
      back: '블로그로 돌아가기',
      backToHome: '홈으로 돌아가기',
      readMore: '더 읽기',
      latestNews: '최신 뉴스',
      by: '작성자',
      minRead: '분 읽기'
    },
    ru: {
      back: 'Назад к блогу',
      backToHome: 'На главную',
      readMore: 'Читать далее',
      latestNews: 'Последние новости',
      by: 'Автор',
      minRead: 'мин чтения'
    }
  };

  const t = translations[language];

  if (selectedPost) {
    const content = getLocalizedContent(selectedPost);
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedPost(null)}
            className="mb-6 hover:bg-pink-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>

          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-64 sm:h-80 bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center">
              <span className="text-6xl">🍃</span>
            </div>
            
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                  {content.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedPost.readTime} {t.minRead}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
                {content.title}
              </h1>

              <div className="flex items-center gap-2 mb-8 text-gray-600">
                <User className="w-4 h-4" />
                <span>{t.by} {selectedPost.author}</span>
              </div>

              <div className="prose prose-pink max-w-none">
                {content.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-pink-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToHome}
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold gradient-text mb-4">
            {t.latestNews}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Discover the world of Korean tea through our stories, guides, and latest updates.'
              : language === 'ko'
              ? '우리의 이야기, 가이드, 최신 업데이트를 통해 한국 차의 세계를 발견하세요.'
              : 'Откройте для себя мир корейского чая через наши истории, руководства и последние обновления.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => {
            const content = getLocalizedContent(post);
            return (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setSelectedPost(post)}
              >
                <div className="h-48 bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-5xl">🍃</span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                      {content.category}
                    </span>
                    <span>{post.date}</span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {content.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {content.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} {t.minRead}
                    </span>
                    <span className="text-pink-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t.readMore}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
