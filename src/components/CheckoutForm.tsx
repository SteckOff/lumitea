import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Check, Mail, Lock } from 'lucide-react';
import { KoreanAddressForm } from './KoreanAddressForm';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface CheckoutFormProps {
  amount: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    itemType?: 'product' | 'gift_set';
  }>;
  onSuccess: () => void;
  onCancel: () => void;
  language: 'en' | 'ko' | 'ru';
}

export function CheckoutForm({ amount, items, onCancel, language }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<any>(null);
  const [orderNo, setOrderNo] = useState<string>('');

  const content = {
    en: {
      orderSummary: 'Order Summary',
      items: 'Items',
      shipping: 'Shipping',
      shippingCost: '3,000 KRW',
      freeShipping: 'FREE (orders over 50,000 KRW)',
      total: 'Total',
      addressTitle: 'Delivery Address',
      paymentTitle: 'Payment',
      successTitle: 'Order Confirmed!',
      successMessage: 'Thank you! A confirmation email will be sent to',
      orderNumber: 'Order Number',
      processing: 'Processing...',
      payNow: 'Pay Now',
      back: 'Back',
      securePayment: 'Secure payment by Stripe',
      loginRequired: 'Please sign in to complete your purchase.',
      loginButton: 'Sign in',
      cardInfo: 'Card Information',
      testCard: 'Test card: 4242 4242 4242 4242',
    },
    ko: {
      orderSummary: '주문 요약',
      items: '상품',
      shipping: '배송비',
      shippingCost: '3,000원',
      freeShipping: '무료배송 (5만원 이상)',
      total: '총액',
      addressTitle: '배송 주소',
      paymentTitle: '결제',
      successTitle: '주문 완료!',
      successMessage: '주문해 주셔서 감사합니다! 확인 이메일을 보내드렸습니다.',
      orderNumber: '주문번호',
      processing: '처리 중...',
      payNow: '결제하기',
      back: '뒤로',
      securePayment: 'Stripe 안전 결제',
      loginRequired: '구매를 완료하려면 로그인해 주세요.',
      loginButton: '로그인',
      cardInfo: '카드 정보',
      testCard: '테스트 카드: 4242 4242 4242 4242',
    },
    ru: {
      orderSummary: 'Сводка заказа',
      items: 'Товары',
      shipping: 'Доставка',
      shippingCost: '3,000 KRW',
      freeShipping: 'БЕСПЛАТНО (от 50,000 KRW)',
      total: 'Итого',
      addressTitle: 'Адрес доставки',
      paymentTitle: 'Оплата',
      successTitle: 'Заказ оформлен!',
      successMessage: 'Спасибо! Письмо с подтверждением отправлено на',
      orderNumber: 'Номер заказа',
      processing: 'Обработка...',
      payNow: 'Оплатить',
      back: 'Назад',
      securePayment: 'Безопасная оплата через Stripe',
      loginRequired: 'Войдите в аккаунт, чтобы оформить заказ.',
      loginButton: 'Войти',
      cardInfo: 'Данные карты',
      testCard: 'Тестовая карта: 4242 4242 4242 4242',
    },
  };

  const t = content[language];

  // Calculate shipping
  const shippingCost = amount >= 50000 ? 0 : 3000;
  const finalTotal = amount + shippingCost;

  const handleAddressSubmit = (addr: any) => {
    setAddress(addr);
    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    if (!isAuthenticated || !user) {
      setError(t.loginRequired);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Get session JWT for Edge Function auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(t.loginRequired);

      // 2. Call Edge Function — creates order in DB + Stripe PaymentIntent
      const { data: piData, error: fnError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            items: items.map((item) => ({
              item_type: item.itemType ?? 'product',
              item_id: item.id,
              quantity: item.quantity,
            })),
            address: {
              recipient_name: address.name,
              phone: address.phone,
              postal_code: address.postalCode,
              address1: address.address1,
              address2: address.address2 || undefined,
            },
            locale: language,
          },
        },
      );

      if (fnError) throw new Error(fnError.message);
      if (piData?.error) throw new Error(piData.error);

      const { client_secret: clientSecret, order_no } = piData as {
        client_secret: string;
        order_no: string;
      };

      // 3. Confirm card payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: address.name,
              phone: address.phone,
            },
          },
        },
      );

      if (stripeError) {
        throw new Error(stripeError.message ?? 'Payment failed');
      }

      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment was not completed. Please try again.');
      }

      // 4. Payment succeeded — the stripe-webhook Edge Function will mark the order as `paid`
      setOrderNo(order_no);
      setStep('success');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-green-600 mb-2">{t.successTitle}</h3>
        <p className="text-gray-600 mb-4">{t.successMessage}</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-500">{t.orderNumber}</p>
          <p className="text-lg font-bold">{orderNo}</p>
        </div>
        {user?.email && (
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            {user.email}
          </p>
        )}
      </div>
    );
  }

  // ── Address step ─────────────────────────────────────────────────────────
  if (step === 'address') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">{t.addressTitle}</h3>
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm">
            {t.loginRequired}
          </div>
        )}
        <KoreanAddressForm onSubmit={handleAddressSubmit} language={language} />
        <Button variant="outline" onClick={onCancel} className="w-full">
          {t.back}
        </Button>
      </div>
    );
  }

  // ── Payment step ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <h3 className="text-lg font-bold">{t.paymentTitle}</h3>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="font-medium mb-2">{t.orderSummary}</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{t.items}:</span>
            <span>{amount.toLocaleString()} KRW</span>
          </div>
          <div className="flex justify-between">
            <span>{t.shipping}:</span>
            <span>{shippingCost === 0 ? t.freeShipping : shippingCost.toLocaleString() + ' KRW'}</span>
          </div>
          <div className="border-t pt-1 flex justify-between font-bold">
            <span>{t.total}:</span>
            <span className="text-pink-500">{finalTotal.toLocaleString()} KRW</span>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t.cardInfo}</label>
        <div className="border rounded-xl p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#9e2146' },
              },
            }}
          />
        </div>
        {import.meta.env.DEV && (
          <p className="text-xs text-gray-400">{t.testCard}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('address')}
          className="flex-1"
        >
          {t.back}
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 btn-primary"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {t.payNow}
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Lock className="w-3 h-3" />
        <span>{t.securePayment}</span>
      </div>
    </form>
  );
}
