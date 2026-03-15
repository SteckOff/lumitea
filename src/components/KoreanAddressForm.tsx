import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Home, Building, Phone, User } from 'lucide-react';

interface KoreanAddressFormProps {
  onSubmit: (address: {
    name: string;
    phone: string;
    postalCode: string;
    address1: string;
    address2: string;
    deliveryNote?: string;
  }) => void;
  language: 'en' | 'ko' | 'ru';
}

export function KoreanAddressForm({ onSubmit, language }: KoreanAddressFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    postalCode: '',
    address1: '',
    address2: '',
    deliveryNote: ''
  });

  const content = {
    en: {
      title: 'Delivery Address',
      subtitle: 'Shipping within South Korea only',
      name: 'Recipient Name',
      namePlaceholder: 'Enter recipient name',
      phone: 'Phone Number',
      phonePlaceholder: '010-1234-5678',
      postalCode: 'Postal Code',
      postalCodePlaceholder: '5-digit code',
      address1: 'Address',
      address1Placeholder: 'Street address, building name',
      address2: 'Detailed Address',
      address2Placeholder: 'Apartment, unit, floor',
      deliveryNote: 'Delivery Note (Optional)',
      deliveryNotePlaceholder: 'Leave at door, call before delivery...',
      continue: 'Continue to Payment',
      required: 'Required field'
    },
    ko: {
      title: '배송 주소',
      subtitle: '대한민국 내 배송만 가능합니다',
      name: '수령인 이름',
      namePlaceholder: '수령인 이름을 입력하세요',
      phone: '전화번호',
      phonePlaceholder: '010-1234-5678',
      postalCode: '우편번호',
      postalCodePlaceholder: '5자리 코드',
      address1: '주소',
      address1Placeholder: '도로명 주소, 건축물명',
      address2: '상세 주소',
      address2Placeholder: '아파트, 동, 호수',
      deliveryNote: '배송 메모 (선택)',
      deliveryNotePlaceholder: '문 앞에 놓아주세요, 배송 전 연락...',
      continue: '결제 계속하기',
      required: '필수 입력 항목'
    },
    ru: {
      title: 'Адрес доставки',
      subtitle: 'Доставка только по Южной Корее',
      name: 'Имя получателя',
      namePlaceholder: 'Введите имя получателя',
      phone: 'Номер телефона',
      phonePlaceholder: '010-1234-5678',
      postalCode: 'Почтовый индекс',
      postalCodePlaceholder: '5-значный код',
      address1: 'Адрес',
      address1Placeholder: 'Улица, название здания',
      address2: 'Подробный адрес',
      address2Placeholder: 'Квартира, этаж, подъезд',
      deliveryNote: 'Примечание (Необязательно)',
      deliveryNotePlaceholder: 'Оставить у двери, позвонить перед доставкой...',
      continue: 'Продолжить к оплате',
      required: 'Обязательное поле'
    }
  };

  const t = content[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-pink-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-pink-600 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {t.subtitle}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.name} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t.namePlaceholder}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.phone} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t.phonePlaceholder}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.postalCode} <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={formData.postalCode}
          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          placeholder={t.postalCodePlaceholder}
          maxLength={5}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.address1} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={formData.address1}
            onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
            placeholder={t.address1Placeholder}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.address2}
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={formData.address2}
            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
            placeholder={t.address2Placeholder}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.deliveryNote}
        </label>
        <Input
          type="text"
          value={formData.deliveryNote}
          onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
          placeholder={t.deliveryNotePlaceholder}
        />
      </div>

      <Button type="submit" className="w-full btn-primary mt-6">
        {t.continue}
      </Button>
    </form>
  );
}
