import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Check, Mail } from 'lucide-react';
import { KoreanAddressForm } from './KoreanAddressForm';
import { useAuth } from '@/context/AuthContext';

interface CheckoutFormProps {
  amount: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  onSuccess: () => void;
  onCancel: () => void;
  language: 'en' | 'ko' | 'ru';
}

export function CheckoutForm({ amount, items, onSuccess, onCancel, language }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');

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
      successMessage: 'Thank you for your order. A confirmation email has been sent.',
      orderNumber: 'Order Number',
      processing: 'Processing...',
      payNow: 'Pay Now',
      back: 'Back',
      securePayment: 'Secure payment by Stripe',
      emailSent: 'Confirmation email sent to'
    },
    ko: {
      orderSummary: '주문 요약',
      items: '상품',
      shipping: '배송비',
      shippingCost: '3,000원',
      freeShipping: '묶음배송 (5만원 이상)',
      total: '총액',
      addressTitle: '배송 주소',
      paymentTitle: '결제',
      successTitle: '주문 완료!',
      successMessage: '주문해 주셔서 감사합니다. 확인 이메일을 본내드렸습니다.',
      orderNumber: '주문번호',
      processing: '처리 중...',
      payNow: '결제하기',
      back: '뒤로',
      securePayment: 'Stripe 안전 결제',
      emailSent: '확인 이메일 발송'
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
      successTitle: 'Заказ подтвержден!',
      successMessage: 'Спасибо за заказ. Письмо с подтверждением отправлено.',
      orderNumber: 'Номер заказа',
      processing: 'Обработка...',
      payNow: 'Оплатить',
      back: 'Назад',
      securePayment: 'Безопасная оплата через Stripe',
      emailSent: 'Подтверждение отправлено на'
    }
  };

  const t = content[language];

  // Calculate shipping
  const shippingCost = amount >= 50000 ? 0 : 3000;
  const finalTotal = amount + shippingCost;

  const handleAddressSubmit = (addr: any) => {
    setAddress(addr);
    setStep('payment');
  };

  const sendOrderConfirmationEmail = (orderData: any) => {
    // In production, this would call your backend API
    // For demo, we'll create a mailto link that opens email client
    const emailBody = encodeURIComponent(`
LUMI TEA - Order Confirmation

Order Number: ${orderData.orderId}
Date: ${new Date().toLocaleString()}

Shipping Address:
${orderData.address.name}
${orderData.address.phone}
${orderData.address.postalCode}
${orderData.address.address1}
${orderData.address.address2 || ''}

Items:
${orderData.items.map((item: any) => `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} KRW`).join('\n')}

Subtotal: ${orderData.subtotal.toLocaleString()} KRW
Shipping: ${orderData.shipping === 0 ? 'FREE' : orderData.shipping.toLocaleString() + ' KRW'}
Total: ${orderData.total.toLocaleString()} KRW

Thank you for choosing Lumi Tea!
We'll send tracking information once your order ships.

Questions? Reply to this email or contact us at hello@lumitea.kr
    `);

    // Open email client with pre-filled order details
    window.open(`mailto:${user?.email || address?.name?.replace(/\s/g, '').toLowerCase() + '@email.com'}?subject=Lumi Tea Order Confirmation - ${orderData.orderId}&body=${emailBody}`, '_blank');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Simulate payment processing
    setTimeout(() => {
      const newOrderId = 'LUMI-' + Date.now().toString().slice(-8);
      setOrderId(newOrderId);
      
      // Save order to localStorage (in production, save to database)
      const orderData = {
        orderId: newOrderId,
        userId: user?.id || 'guest',
        items,
        address,
        subtotal: amount,
        shipping: shippingCost,
        total: finalTotal,
        status: 'paid',
        createdAt: new Date().toISOString()
      };
      
      const orders = JSON.parse(localStorage.getItem('lumi_tea_orders') || '[]');
      orders.push(orderData);
      localStorage.setItem('lumi_tea_orders', JSON.stringify(orders));

      // Send confirmation email
      sendOrderConfirmationEmail(orderData);

      setIsProcessing(false);
      setStep('success');
      
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }, 2000);
  };

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
          <p className="text-lg font-bold">{orderId}</p>
        </div>
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          {t.emailSent} {user?.email || address?.name}
        </p>
      </div>
    );
  }

  if (step === 'address') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">{t.addressTitle}</h3>
        <KoreanAddressForm onSubmit={handleAddressSubmit} language={language} />
        <Button variant="outline" onClick={onCancel} className="w-full">
          {t.back}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <h3 className="text-lg font-bold">{t.paymentTitle}</h3>
      
      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Card Information</label>
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
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
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
        <span>{t.securePayment}</span>
      </div>
    </form>
  );
}
