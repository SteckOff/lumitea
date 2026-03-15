import React, { useState } from 'react';
import { CreditCard, MessageCircle, Phone, Check } from 'lucide-react';

interface CheckoutPaymentProps {
    total: number;
    onPaymentMethodSelect: (method: string) => void;
    selectedMethod: string | null;
}

export function CheckoutPayment({ total, onPaymentMethodSelect, selectedMethod }: CheckoutPaymentProps) {
    const [showKakaoModal, setShowKakaoModal] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-serif font-semibold text-stone-800 mb-4">
                Payment Method
            </h3>

            {/* Card Payment - Disabled */}
            <div className="relative">
                <div 
                    className="w-full p-6 border-2 border-stone-200 rounded-xl bg-stone-50 opacity-60 cursor-not-allowed flex items-center gap-4"
                >
                    <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-stone-400" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-stone-500">Credit/Debit Card</p>
                        <p className="text-sm text-stone-400">Visa, Mastercard, etc.</p>
                    </div>
                </div>
                
                {/* Disabled Overlay */}
                <div className="absolute inset-0 bg-stone-100/80 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-stone-300 text-stone-600 rounded-full text-sm font-medium">
                            Temporarily Unavailable
                        </span>
                    </div>
                </div>
            </div>

            {/* KakaoTalk Payment */}
            <button
                onClick={() => {
                    onPaymentMethodSelect('kakaotalk');
                    setShowKakaoModal(true);
                }}
                className={`w-full p-6 border-2 rounded-xl transition-all flex items-center gap-4 ${
                    selectedMethod === 'kakaotalk'
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-stone-200 hover:border-yellow-300 bg-white'
                }`}
            >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedMethod === 'kakaotalk' ? 'bg-yellow-400' : 'bg-yellow-100'
                }`}>
                    <MessageCircle className="w-6 h-6 text-stone-800" />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-medium text-stone-800">KakaoTalk</p>
                    <p className="text-sm text-stone-500">Chat with us to complete payment</p>
                </div>
                {selectedMethod === 'kakaotalk' && (
                    <Check className="w-6 h-6 text-yellow-600" />
                )}
            </button>

            {/* Phone Payment */}
            <button
                onClick={() => onPaymentMethodSelect('phone')}
                className={`w-full p-6 border-2 rounded-xl transition-all flex items-center gap-4 ${
                    selectedMethod === 'phone'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-stone-200 hover:border-teal-400 bg-white'
                }`}
            >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedMethod === 'phone' ? 'bg-teal-600' : 'bg-teal-100'
                }`}>
                    <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-medium text-stone-800">Phone Order</p>
                    <p className="text-sm text-stone-500">Call us to place your order</p>
                </div>
                {selectedMethod === 'phone' && (
                    <Check className="w-6 h-6 text-teal-600" />
                )}
            </button>

            {/* Order Summary */}
            <div className="mt-8 p-6 bg-stone-50 rounded-xl">
                <h4 className="font-medium text-stone-800 mb-4">Order Summary</h4>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="text-stone-800">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-600">Shipping</span>
                    <span className="text-stone-500">
                        {total >= 50000 ? 'Free' : 'Calculated at checkout'}
                    </span>
                </div>
                <div className="border-t border-stone-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-stone-800">Total</span>
                        <span className="text-xl font-semibold text-teal-700">
                            {formatPrice(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* KakaoTalk Modal */}
            {showKakaoModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-stone-800" />
                            </div>
                            <h3 className="text-2xl font-serif font-semibold text-stone-800 mb-2">
                                Complete Your Order via KakaoTalk
                            </h3>
                            <p className="text-stone-600">
                                Chat with us directly to confirm your order and arrange payment
                            </p>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-stone-700 mb-2">
                                <strong>Your Order Total:</strong> {formatPrice(total)}
                            </p>
                            <p className="text-sm text-stone-600">
                                Mention this amount when chatting with us
                            </p>
                        </div>

                        <div className="space-y-3">
                            <a
                                href="https://pf.kakao.com/_lumi__tea_"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-yellow-400 text-stone-800 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Open KakaoTalk Chat
                            </a>
                            <button
                                onClick={() => setShowKakaoModal(false)}
                                className="w-full py-3 text-stone-600 hover:text-stone-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>

                        <p className="text-center text-sm text-stone-500 mt-4">
                            We typically respond within 30 minutes
                        </p>
                    </div>
                </div>
            )}

            {/* Phone Modal */}
            {selectedMethod === 'phone' && (
                <div className="mt-4 p-6 bg-teal-50 rounded-xl">
                    <h4 className="font-medium text-teal-800 mb-3">Call Us</h4>
                    <p className="text-teal-700 mb-4">
                        Call us to place your order. Have your items ready!
                    </p>
                    <a
                        href="tel:+821012345678"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        <Phone className="w-5 h-5" />
                        +82 10-1234-5678
                    </a>
                    <p className="text-sm text-teal-600 mt-3">
                        Business hours: 9:00 AM - 6:00 PM (Mon-Sat)
                    </p>
                </div>
            )}
        </div>
    );
}

export default CheckoutPayment;
