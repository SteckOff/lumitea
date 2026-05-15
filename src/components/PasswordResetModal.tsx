import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Check, AlertCircle } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ko' | 'ru';
}

export function PasswordResetModal({ isOpen, onClose, language }: PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const content = {
    en: {
      title: 'Reset Password',
      description: 'Enter your email and we will send you a link to reset your password.',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      send: 'Send reset link',
      success: 'Reset link sent! Check your inbox.',
      checkSpam: "Don't see it? Check your spam folder.",
      genericError: 'Something went wrong. Please try again.',
      close: 'Close',
    },
    ko: {
      title: '비밀번호 재설정',
      description: '이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.',
      emailLabel: '이메일',
      emailPlaceholder: 'your@email.com',
      send: '재설정 링크 보내기',
      success: '재설정 링크를 발송했습니다! 받은 편지함을 확인하세요.',
      checkSpam: '보이지 않나요? 스팸 폴더를 확인하세요.',
      genericError: '문제가 발생했습니다. 다시 시도해주세요.',
      close: '닫기',
    },
    ru: {
      title: 'Сброс пароля',
      description: 'Введите email — мы пришлём ссылку для сброса пароля.',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      send: 'Отправить ссылку',
      success: 'Ссылка отправлена! Проверьте почту.',
      checkSpam: 'Не видите письмо? Проверьте папку «Спам».',
      genericError: 'Что-то пошло не так. Попробуйте снова.',
      close: 'Закрыть',
    },
  };

  const t = content[language];

  const handleSend = async () => {
    setIsLoading(true);
    setError('');
    const ok = await resetPassword(email);
    setIsLoading(false);
    if (ok) {
      setSent(true);
    } else {
      setError(t.genericError);
    }
  };

  const handleClose = () => {
    onClose();
    setSent(false);
    setEmail('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-pink-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-green-600 font-medium">{t.success}</p>
            <p className="text-sm text-gray-500">{t.checkSpam}</p>
            <Button onClick={handleClose} className="mt-2">{t.close}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">{t.description}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder={t.emailPlaceholder}
                  className="pl-10"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <Button onClick={handleSend} className="w-full btn-primary" disabled={!email || isLoading}>
              {isLoading ? '...' : t.send}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
