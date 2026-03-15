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
    phone: ''
  });

  const content = {
    en: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
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
      verificationNote: 'Your verification code has been sent to your email.',
      notVerified: 'Please verify your email before logging in. Check your inbox for the verification code.'
    },
    ko: {
      login: '로그인',
      register: '회원가입',
      email: '이메일',
      password: '비밀번호',
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
      verificationNote: '인증 코드가 이메일로 발송되었습니다.',
      notVerified: '로그인하기 전에 이메일을 인증해주세요. 인증 코드를 받은 편지함을 확인하세요.'
    },
    ru: {
      login: 'Вход',
      register: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
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
      verificationNote: 'Код подтверждения отправлен на вашу почту.',
      notVerified: 'Пожалуйста, подтвердите email перед входом. Проверьте письмо с кодом подтверждения.'
    }
  };

  const t = content[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const success = await login(loginData.email, loginData.password);
    
    if (success) {
      alert(t.loginSuccess);
      onClose();
      setLoginData({ email: '', password: '' });
    } else {
      // Check if user exists but not verified
      const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
      const user = users.find((u: any) => u.email === loginData.email && u.password === loginData.password);
      if (user && !user.isVerified) {
        setError(t.notVerified);
        setRegisteredEmail(loginData.email);
        setShowVerification(true);
      } else {
        setError(t.errorLogin);
      }
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
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
                      minLength={6}
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
