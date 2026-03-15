import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Check } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ko' | 'ru';
}

export function PasswordResetModal({ isOpen, onClose, language }: PasswordResetModalProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword, updatePassword } = useAuth();

  const content = {
    en: {
      title: 'Reset Password',
      emailStep: 'Enter your email',
      codeStep: 'Enter verification code',
      passwordStep: 'Create new password',
      success: 'Password reset successfully!',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      codeLabel: 'Verification Code',
      codePlaceholder: '000000',
      passwordLabel: 'New Password',
      confirmLabel: 'Confirm Password',
      sendCode: 'Send Code',
      verify: 'Verify',
      reset: 'Reset Password',
      backToLogin: 'Back to Login',
      passwordMismatch: 'Passwords do not match',
      emailNotFound: 'Email not found'
    },
    ko: {
      title: '비밀번호 재설정',
      emailStep: '이메일을 입력하세요',
      codeStep: '인증 코드를 입력하세요',
      passwordStep: '새 비밀번호를 만드세요',
      success: '비밀번호가 성공적으로 재설정되었습니다!',
      emailLabel: '이메일',
      emailPlaceholder: 'your@email.com',
      codeLabel: '인증 코드',
      codePlaceholder: '000000',
      passwordLabel: '새 비밀번호',
      confirmLabel: '비밀번호 확인',
      sendCode: '코드 발송',
      verify: '인증하기',
      reset: '비밀번호 재설정',
      backToLogin: '로그인으로 돌아가기',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
      emailNotFound: '이메일을 찾을 수 없습니다'
    },
    ru: {
      title: 'Сброс пароля',
      emailStep: 'Введите ваш email',
      codeStep: 'Введите код подтверждения',
      passwordStep: 'Создайте новый пароль',
      success: 'Пароль успешно сброшен!',
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      codeLabel: 'Код подтверждения',
      codePlaceholder: '000000',
      passwordLabel: 'Новый пароль',
      confirmLabel: 'Подтвердите пароль',
      sendCode: 'Отправить код',
      verify: 'Подтвердить',
      reset: 'Сбросить пароль',
      backToLogin: 'Вернуться к входу',
      passwordMismatch: 'Пароли не совпадают',
      emailNotFound: 'Email не найден'
    }
  };

  const t = content[language];

  const handleSendCode = async () => {
    const success = await resetPassword(email);
    if (success) {
      setStep('code');
      setError('');
    } else {
      setError(t.emailNotFound);
    }
  };

  const handleVerifyCode = () => {
    if (code.length === 6) {
      setStep('password');
      setError('');
    }
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (newPassword.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters' : language === 'ko' ? '비밀번호는 최소 6자 이상이어야 합니다' : 'Пароль должен быть не менее 6 символов');
      return;
    }
    
    const success = updatePassword(code, newPassword);
    if (success) {
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('email');
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-pink-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'email' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">{t.emailStep}</p>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleSendCode} className="w-full btn-primary" disabled={!email}>
              {t.sendCode}
            </Button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">{t.codeStep}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.codeLabel}</label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t.codePlaceholder}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            <Button onClick={handleVerifyCode} className="w-full btn-primary" disabled={code.length !== 6}>
              {t.verify}
            </Button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">{t.passwordStep}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.passwordLabel}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmLabel}</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleResetPassword} className="w-full btn-primary" disabled={!newPassword || !confirmPassword}>
              {t.reset}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-green-600 font-medium">{t.success}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
