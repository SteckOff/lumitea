import { useEffect, useRef, useState } from 'react';
import { Mail, MapPin, Phone, Send, Instagram, MessageCircle, Facebook, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/services/api';

interface ContactProps {
  language: 'en' | 'ko' | 'ru';
}

// Korean Social Media Icons
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

const Contact = ({ language }: ContactProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send via API
      await api.sendContact(formData.name, formData.email, formData.subject || 'Contact Form', formData.message);
      
      alert(language === 'en' ? 'Message sent! We will contact you soon.' : 
            language === 'ko' ? '메시지가 전송되었습니다! 곧 연락드리겠습니다.' : 
            'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
      
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.log('API error, saving locally');
      // Save to localStorage as fallback
      const contacts = JSON.parse(localStorage.getItem('lumi_tea_contacts') || '[]');
      contacts.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('lumi_tea_contacts', JSON.stringify(contacts));
      
      alert(language === 'en' ? 'Message saved! We will contact you soon.' : 
            language === 'ko' ? '메시지가 저장되었습니다! 곧 연락드리겠습니다.' : 
            'Сообщение сохранено! Мы свяжемся с вами в ближайшее время.');
    }
    
    setIsSubmitting(false);
  };

  const content = {
    en: {
      title: 'Get in',
      subtitle: 'Touch',
      description: 'Have questions? We are always happy to help! Contact us anytime - we work 24/7',
      formTitle: 'Send Message',
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your name',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'What is this about?',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell us how we can help...',
      sendButton: 'Send',
      sentButton: 'Sent!',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      socialTitle: 'Follow Us',
      hoursTitle: 'Opening Hours',
      hours24: '24/7 - Every Day',
      telegram: 'Telegram'
    },
    ko: {
      title: '연락',
      subtitle: '하기',
      description: '질문이 있으신가요? 언제나 도와드릴 준비가 되어 있습니다! 연중무휴 24시간 운영됩니다',
      formTitle: '메시지 볂기',
      nameLabel: '이름',
      namePlaceholder: '이름을 입력하세요',
      emailLabel: '이메일',
      emailPlaceholder: 'your@email.com',
      subjectLabel: '제목',
      subjectPlaceholder: '무엇에 관한 것인가요?',
      messageLabel: '메시지',
      messagePlaceholder: '어떻게 도와드릴 수 있을까요...',
      sendButton: '볂기',
      sentButton: '전송 완료!',
      address: '주소',
      phone: '전화',
      email: '이메일',
      socialTitle: '팔로우하기',
      hoursTitle: '영업 시간',
      hours24: '24시간 - 연중무휴',
      telegram: '텔레그램'
    },
    ru: {
      title: 'Свяжитесь',
      subtitle: 'С Нами',
      description: 'Есть вопросы? Мы всегда рады помочь! Свяжитесь с нами в любое время - мы работаем 24/7',
      formTitle: 'Отправить сообщение',
      nameLabel: 'Ваше имя',
      namePlaceholder: 'Введите имя',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      subjectLabel: 'Тема',
      subjectPlaceholder: 'О чем это?',
      messageLabel: 'Сообщение',
      messagePlaceholder: 'Расскажите, чем мы можем помочь...',
      sendButton: 'Отправить',
      sentButton: 'Отправлено!',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Email',
      socialTitle: 'Мы в соцсетях',
      hoursTitle: 'Часы работы',
      hours24: '24/7 - Каждый день',
      telegram: 'Telegram'
    }
  };

  const t = content[language];

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t.address,
      content: '인천광역시 연수구 함박로12번길 14 (연수동 489-3), 202호\nIncheon Yeonsu-gu Hambak-ro 12beon-gil 14, 202ho',
      link: '#'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: t.phone,
      content: '+82 10 2187 3643',
      link: 'tel:+821021873643'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t.email,
      content: 'lumitea.kr@gmail.com',
      link: 'mailto:lumitea.kr@gmail.com'
    }
  ];

  // All 6 social links - circular style
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
    <section id="contact" ref={sectionRef} className="py-20 lg:py-32 bg-gradient-to-b from-cream to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 reveal opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t.title} <span className="gradient-text">{t.subtitle}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="reveal opacity-0 bg-white rounded-3xl p-8 shadow-xl" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold mb-6">{t.formTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.nameLabel}</label>
                <Input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailLabel}</label>
                <Input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.subjectLabel}</label>
                <Input
                  type="text"
                  placeholder={t.subjectPlaceholder}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.messageLabel}</label>
                <Textarea
                  placeholder={t.messagePlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-primary rounded-xl py-6" disabled={isSubmitting || sent}>
                <Send className="w-4 h-4 mr-2" />
                {sent ? t.sentButton : t.sendButton}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="reveal opacity-0 space-y-4" style={{ animationDelay: '0.3s' }}>
              {contactInfo.map((info) => (
                <a
                  key={info.title}
                  href={info.link}
                  className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{info.title}</h4>
                    <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Links - All 6 circular */}
            <div className="reveal opacity-0 bg-white rounded-2xl p-6 shadow-lg" style={{ animationDelay: '0.4s' }}>
              <h4 className="font-bold mb-4">{t.socialTitle}</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full ${social.bgColor} flex items-center justify-center hover:opacity-80 transition-opacity text-white`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Working Hours - 24/7 */}
            <div className="reveal opacity-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white" style={{ animationDelay: '0.5s' }}>
              <h4 className="font-bold mb-4">{t.hoursTitle}</h4>
              <div className="flex items-center justify-between">
                <span className="text-lg">{t.hours24}</span>
                <span className="text-2xl">🕐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
