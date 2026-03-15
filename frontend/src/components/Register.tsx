import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Lock, User, ArrowRight, Check, Loader2 } from 'lucide-react';

interface RegisterProps {
    onSuccess?: () => void;
    onLoginClick?: () => void;
}

export function Register({ onSuccess, onLoginClick }: RegisterProps) {
    const { sendVerification, register } = useAuth();
    const [step, setStep] = useState<'email' | 'code' | 'details'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await sendVerification(email);
            setCodeSent(true);
            setStep('code');
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }
        setError('');
        setStep('details');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, code, password, name);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-semibold text-stone-800 mb-2">
                    Create Account
                </h2>
                <p className="text-stone-600">
                    Join Lumi Tea for exclusive offers
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${step === 'email' ? 'text-teal-600' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === 'email' ? 'bg-teal-600 text-white' : 'bg-stone-200'
                    }`}>
                        1
                    </div>
                    <span className="text-sm">Email</span>
                </div>
                <div className="w-8 h-px bg-stone-300" />
                <div className={`flex items-center gap-2 ${step === 'code' ? 'text-teal-600' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === 'code' ? 'bg-teal-600 text-white' : 'bg-stone-200'
                    }`}>
                        2
                    </div>
                    <span className="text-sm">Verify</span>
                </div>
                <div className="w-8 h-px bg-stone-300" />
                <div className={`flex items-center gap-2 ${step === 'details' ? 'text-teal-600' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === 'details' ? 'bg-teal-600 text-white' : 'bg-stone-200'
                    }`}>
                        3
                    </div>
                    <span className="text-sm">Details</span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email.includes('@')}
                        className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Send Verification Code
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm text-stone-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="text-teal-600 hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </form>
            )}

            {/* Step 2: Verification Code */}
            {step === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-teal-600" />
                        </div>
                        <p className="text-stone-600">
                            We've sent a 6-digit code to
                        </p>
                        <p className="font-medium text-stone-800">{email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            maxLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={code.length !== 6}
                        className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Verify Code
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="w-full py-3 text-stone-600 hover:text-stone-800 transition-colors"
                    >
                        Change Email
                    </button>

                    <p className="text-center text-sm text-stone-500">
                        Didn't receive it?{' '}
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={isLoading}
                            className="text-teal-600 hover:underline disabled:opacity-50"
                        >
                            Resend
                        </button>
                    </p>
                </form>
            )}

            {/* Step 3: User Details */}
            {step === 'details' && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !name || password.length < 8 || password !== confirmPassword}
                        className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Create Account
                                <Check className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}

export default Register;
