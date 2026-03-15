import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Mail, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  language: 'en' | 'ko' | 'ru';
  email?: string;
}

export function EmailVerificationModal({ isOpen, onClose, onVerified, language, email }: EmailVerificationModalProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { verifyEmail, resendVerificationCode } = useAuth();

  const content = {
    en: {
      title: 'Verify Your Email',
      description: 'Please enter the 6-digit code sent to your email',
      codeLabel: 'Verification Code',
      codePlaceholder: '000000',
      verify: 'Verify',
      resend: 'Resend Code',
      success: 'Email verified successfully!',
      error: 'Invalid code. Please try again.',
      emailSentTo: 'Code sent to:',
      resendSuccess: 'New code sent! Check your email.'
    },
    ko: {
      title: '이메일 인증',
      description: '이메일로 발송된 6자리 코드를 입력하세요',
      codeLabel: '인증 코드',
      codePlaceholder: '000000',
      verify: '인증하기',
      resend: '코드 재발송',
      success: '이메일 인증이 완료되었습니다!',
      error: '잘못된 코드입니다. 다시 시도해주세요.',
      emailSentTo: '코드 발송된 주소:',
      resendSuccess: '새 코드가 발송되었습니다! 이메일을 확인하세요.'
    },
    ru: {
      title: 'Подтвердите Email',
      description: 'Введите 6-значный код, отправленный на ваш email',
      codeLabel: 'Код подтверждения',
      codePlaceholder: '000000',
      verify: 'Подтвердить',
      resend: 'Отправить код повторно',
      success: 'Email успешно подтвержден!',
      error: 'Неверный код. Попробуйте снова.',
      emailSentTo: 'Код отправлен на:',
      resendSuccess: 'Новый код отправлен! Проверьте почту.'
    }
  };

  const t = content[language];

  const handleVerify = () => {
    if (inputCode.length === 6) {
      const isValid = verifyEmail(inputCode);
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1500);
      } else {
        setError(t.error);
      }
    }
  };

  const handleResend = async () => {
    setResendSuccess(false);
    const result = await resendVerificationCode();
    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } else {
      setError(language === 'en' ? 'Failed to resend code. Please try again.' : language === 'ko' ? '코드 재발송에 실패했습니다. 다시 시도해주세요.' : 'Не удалось отправить код повторно. Попробуйте снова.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Mail className="w-6 h-6 text-pink-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-green-600 font-medium">{t.success}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">{t.description}</p>
            
            {email && (
              <p className="text-sm text-gray-500 text-center">
                {t.emailSentTo} <span className="font-medium text-gray-700">{email}</span>
              </p>
            )}
            
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-600">{t.resendSuccess}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.codeLabel}</label>
              <Input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder={t.codePlaceholder}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <Button onClick={handleVerify} className="w-full btn-primary" disabled={inputCode.length !== 6}>
              {t.verify}
            </Button>
            
            <button
              onClick={handleResend}
              className="w-full text-center text-sm text-gray-500 hover:text-pink-500 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t.resend}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
