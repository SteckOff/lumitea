// Landing page for the password-reset email link.
// Supabase puts the access_token in the URL hash; the SDK picks it up automatically
// once `detectSessionInUrl: true` is set on the client (it is in src/lib/supabase.ts).

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage({ language = 'en' as 'en' | 'ko' | 'ru' }) {
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updatePassword } = useAuth();

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the hash token is consumed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });
    // Also check if session already exists (page refresh scenario)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    // Timeout: if no session after 4s, show error
    const timer = setTimeout(() => {
      setReady(prev => {
        if (!prev) setError(
          language === 'ko' ? '잘못되었거나 만료된 링크입니다.' :
          language === 'ru' ? 'Ссылка некорректна или истекла.' :
          'Invalid or expired link.',
        );
        return prev;
      });
    }, 4000);
    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, [language]);

  const handleSubmit = async () => {
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw)) {
      setError(
        language === 'ko' ? '비밀번호는 8자 이상, 대문자 및 소문자를 포함해야 합니다' :
        language === 'ru' ? 'Пароль: минимум 8 символов, заглавная и строчная буква' :
        'Password must be 8+ characters with uppercase and lowercase letters',
      );
      return;
    }
    if (pw !== confirmPw) {
      setError(
        language === 'ko' ? '비밀번호가 일치하지 않습니다' :
        language === 'ru' ? 'Пароли не совпадают' :
        'Passwords do not match',
      );
      return;
    }
    setSubmitting(true);
    const ok = await updatePassword(pw);
    setSubmitting(false);
    if (ok) setDone(true);
    else setError(
      language === 'ko' ? '비밀번호를 변경하지 못했습니다.' :
      language === 'ru' ? 'Не удалось изменить пароль.' :
      'Failed to update password.',
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-semibold">
            {language === 'ko' ? '비밀번호 재설정' :
             language === 'ru' ? 'Сброс пароля' :
             'Reset password'}
          </h1>
        </div>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-green-600 font-medium">
              {language === 'ko' ? '비밀번호가 변경되었습니다.' :
               language === 'ru' ? 'Пароль изменён.' :
               'Password updated.'}
            </p>
            <Button asChild className="mt-2">
              <a href="/">
                {language === 'ko' ? '홈으로' :
                 language === 'ru' ? 'На главную' :
                 'Back to home'}
              </a>
            </Button>
          </div>
        ) : ready ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ko' ? '새 비밀번호' :
                 language === 'ru' ? 'Новый пароль' :
                 'New password'}
              </label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setError(''); }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ko' ? '비밀번호 확인' :
                 language === 'ru' ? 'Подтвердите пароль' :
                 'Confirm password'}
              </label>
              <Input
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setError(''); }}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <Button onClick={handleSubmit} className="w-full btn-primary" disabled={submitting}>
              {submitting ? '...' :
                language === 'ko' ? '비밀번호 변경' :
                language === 'ru' ? 'Изменить пароль' :
                'Update password'}
            </Button>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            {error || (language === 'ko' ? '로딩 중...' :
                       language === 'ru' ? 'Загрузка...' :
                       'Loading...')}
          </div>
        )}
      </div>
    </div>
  );
}
