import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { EmailVerificationModal } from './EmailVerificationModal';
import { PasswordResetModal } from './PasswordResetModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ko' | 'ru';
}

export function AuthModal({ isOpen, onClose, language }: AuthModalProps) {
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return false;
    if (!/[A-Z]/.test(pw)) return false;
    if (!/[a-z]/.test(pw)) return false;
    if (!/[a-zA-Z]/.test(pw)) return false;
    return true;
  };

  const passwordStrength = (pw: string) => {
    const checks = [
      pw.length >= 8,
      /[A-Z]/.test(pw),
      /[a-z]/.test(pw),
      /[0-9!@#$%^&*]/.test(pw),
    ];
    return checks.filter(Boolean).length;
  };

  const content = {
    en: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      phone: 'Phone Number',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      forgotPassword: 'Forgot password?',
      loginSuccess: 'Welcome back!',
      registerSuccess: 'Account created! Please verify your email.',
      errorLogin: 'Invalid email or password',
      errorRegister: 'Email already exists',
      errorPasswordMismatch: 'Passwords do not match',
      errorPasswordWeak: 'Password must be 8+ characters with uppercase and lowercase letters',
      verificationNote: 'Your verification code has been sent to your email.',
      notVerified: 'Please verify your email before logging in. Check your inbox for the verification code.',
      pwHint: 'Min 8 characters · uppercase · lowercase',
    },
    ko: {
      login: '로그인',
      register: '회원가입',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      name: '이름',
      phone: '전화번호',
      loginButton: '로그인',
      registerButton: '계정 만들기',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      forgotPassword: '비밀번호를 잊으셨나요?',
      loginSuccess: '다시 오신 것을 환영합니다!',
      registerSuccess: '계정이 생성되었습니다! 이메일을 인증해주세요.',
      errorLogin: '이메일 또는 비밀번호가 올바르지 않습니다',
      errorRegister: '이미 존재하는 이메일입니다',
      errorPasswordMismatch: '비밀번호가 일치하지 않습니다',
      errorPasswordWeak: '비밀번호는 8자 이상, 대문자 및 소문자를 포함해야 합니다',
      verificationNote: '인증 코드가 이메일로 발송되었습니다.',
      notVerified: '로그인하기 전에 이메일을 인증해주세요. 인증 코드를 받은 편지함을 확인하세요.',
      pwHint: '8자 이상 · 대문자 · 소문자 포함',
    },
    ru: {
      login: 'Вход',
      register: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      name: 'Полное имя',
      phone: 'Номер телефона',
      loginButton: 'Войти',
      registerButton: 'Создать аккаунт',
      noAccount: 'Нет аккаунта?',
      hasAccount: 'Уже есть аккаунт?',
      forgotPassword: 'Забыли пароль?',
      loginSuccess: 'С возвращением!',
      registerSuccess: 'Аккаунт создан! Пожалуйста, подтвердите email.',
      errorLogin: 'Неверный email или пароль',
      errorRegister: 'Email уже существует',
      errorPasswordMismatch: 'Пароли не совпадают',
      errorPasswordWeak: 'Пароль: минимум 8 символов, заглавная и строчная буква',
      verificationNote: 'Код подтверждения отправлен на вашу почту.',
      notVerified: 'Пожалуйста, подтвердите email перед входом. Проверьте письмо с кодом подтверждения.',
      pwHint: 'Мин. 8 символов · заглавная · строчная',
    }
  };

  const t = content[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const success = await login(loginData.email, loginData.password);

    if (success) {
      onClose();
      setLoginData({ email: '', password: '' });
    } else {
      // Supabase returns the same generic error whether the user is unverified
      // or the password is wrong. Offer the verification flow as a recovery path.
      setError(t.errorLogin);
      setRegisteredEmail(loginData.email);
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(registerData.password)) {
      setError(t.errorPasswordWeak);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError(t.errorPasswordMismatch);
      return;
    }

    setIsLoading(true);
    const result = await register(
      registerData.name,
      registerData.email,
      registerData.password,
      registerData.phone
    );

    if (result.success) {
      setRegisteredEmail(registerData.email);
      setShowVerification(true);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text text-2xl">Lumi Tea</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.login}</TabsTrigger>
              <TabsTrigger value="register">{t.register}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
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
                
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-pink-500 hover:underline"
                >
                  {t.forgotPassword}
                </button>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                  {isLoading ? '...' : t.loginButton}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="pl-10"
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {registerData.password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength(registerData.password) >= i
                              ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-yellow-400' : 'bg-green-500'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">{t.pwHint}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className={`pl-10 pr-10 ${
                        registerData.confirmPassword && registerData.password !== registerData.confirmPassword
                          ? 'border-red-400'
                          : registerData.confirmPassword && registerData.password === registerData.confirmPassword
                          ? 'border-green-400'
                          : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                  {isLoading ? '...' : t.registerButton}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <EmailVerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        onVerified={() => {
          setShowVerification(false);
          onClose();
        }}
        language={language}
        email={registeredEmail}
      />

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        language={language}
      />
    </>
  );
}
