import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { OrderRow, ProfileRow, AddressRow } from '@/lib/database.types';

// Public-facing types preserved from the previous localStorage-backed AuthContext
// so existing components (AuthModal, AdminPanel, CheckoutForm, ...) keep compiling.

interface UiAddress {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}

interface UiUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isVerified: boolean;
  addresses?: UiAddress[];
  isAdmin?: boolean;
}

type UiOrder = {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: Array<{ id: number; name: string; quantity: number; price: number }>;
  address: {
    name: string;
    phone: string;
    postalCode: string;
    address1: string;
    address2?: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderRow['status'];
  createdAt: string;
  printed?: boolean;
};

interface AuthContextType {
  user: UiUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerificationCode: (email?: string) => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  // Admin MFA (TOTP)
  mfaChallenge: () => Promise<{ factorId: string; challengeId: string } | null>;
  mfaVerify: (factorId: string, challengeId: string, code: string) => Promise<boolean>;
  // Addresses
  addAddress: (address: Omit<UiAddress, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  // Admin queries
  getAllOrders: () => Promise<UiOrder[]>;
  getPendingOrders: () => Promise<UiOrder[]>;
  updateOrderStatus: (orderId: string, status: OrderRow['status']) => Promise<void>;
  markOrderAsPrinted: (orderId: string) => Promise<void>;
  getAllSubscribers: () => Promise<string[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function profileToUi(
  user: SupabaseUser,
  profile: ProfileRow | null,
  addresses: AddressRow[],
): UiUser {
  return {
    id: user.id,
    email: user.email ?? profile?.email ?? '',
    name: profile?.name ?? user.user_metadata?.name ?? '',
    phone: profile?.phone ?? user.user_metadata?.phone ?? undefined,
    isVerified: !!user.email_confirmed_at,
    isAdmin: !!profile?.is_admin,
    addresses: addresses.map((a) => ({
      id: a.id,
      name: a.recipient_name,
      phone: a.phone,
      postalCode: a.postal_code,
      address1: a.address1,
      address2: a.address2 ?? undefined,
      isDefault: a.is_default,
    })),
  };
}

function orderToUi(o: OrderRow): UiOrder {
  return {
    orderId: o.order_no,
    userId: o.user_id ?? '',
    userEmail: o.user_email,
    userName: o.user_name ?? '',
    items: (o.items as any[]).map((it) => ({
      id: it.item_id,
      name: it.name_snapshot,
      quantity: it.quantity,
      price: it.price_at_purchase,
    })),
    address: {
      name: o.address_snapshot?.recipient_name ?? '',
      phone: o.address_snapshot?.phone ?? '',
      postalCode: o.address_snapshot?.postal_code ?? '',
      address1: o.address_snapshot?.address1 ?? '',
      address2: o.address_snapshot?.address2 ?? undefined,
    },
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
    printed: o.printed,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }
    const [{ data: profile }, { data: addresses }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false }),
    ]);
    setUser(profileToUi(session.user, profile ?? null, addresses ?? []));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      await refreshUser(data.session);
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      refreshUser(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshUser]);

  const login: AuthContextType['login'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const register: AuthContextType['register'] = async (name, email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) return { success: false, message: error.message };
    // If the project requires email confirmation, the session is null until verified.
    return {
      success: true,
      message: data.session
        ? 'Account created.'
        : 'Account created. Check your email for the verification code.',
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const verifyEmail: AuthContextType['verifyEmail'] = async (code) => {
    // Requires the Supabase "Confirm signup" email template to use {{ .Token }} (6-digit code).
    // Email is taken from the latest signup attempt persisted by Supabase.
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user.email ?? user?.email;
    if (!email) return false;
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    return !error;
  };

  const resendVerificationCode: AuthContextType['resendVerificationCode'] = async (email) => {
    const targetEmail = email ?? user?.email;
    if (!targetEmail) return { success: false };
    const { error } = await supabase.auth.resend({ type: 'signup', email: targetEmail });
    return { success: !error };
  };

  const resetPassword: AuthContextType['resetPassword'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return !error;
  };

  const updatePassword: AuthContextType['updatePassword'] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  };

  // --- MFA (TOTP) for admin ---
  const mfaChallenge: AuthContextType['mfaChallenge'] = async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find((f) => f.status === 'verified');
    if (!totp) return null;
    const { data, error } = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (error || !data) return null;
    return { factorId: totp.id, challengeId: data.id };
  };

  const mfaVerify: AuthContextType['mfaVerify'] = async (factorId, challengeId, code) => {
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    return !error;
  };

  // --- Addresses ---
  const addAddress: AuthContextType['addAddress'] = async (a) => {
    if (!user) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    if (a.isDefault) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', authUser.id);
    }
    await supabase.from('addresses').insert({
      user_id: authUser.id,
      recipient_name: a.name,
      phone: a.phone,
      postal_code: a.postalCode,
      address1: a.address1,
      address2: a.address2 ?? null,
      is_default: a.isDefault,
    });
    const { data: { session } } = await supabase.auth.getSession();
    await refreshUser(session);
  };

  const removeAddress: AuthContextType['removeAddress'] = async (id) => {
    await supabase.from('addresses').delete().eq('id', id);
    const { data: { session } } = await supabase.auth.getSession();
    await refreshUser(session);
  };

  const setDefaultAddress: AuthContextType['setDefaultAddress'] = async (id) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', authUser.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    const { data: { session } } = await supabase.auth.getSession();
    await refreshUser(session);
  };

  // --- Admin queries ---
  const getAllOrders: AuthContextType['getAllOrders'] = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    return (data ?? []).map(orderToUi);
  };

  const getPendingOrders: AuthContextType['getPendingOrders'] = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .eq('printed', false)
      .order('created_at', { ascending: false });
    return (data ?? []).map(orderToUi);
  };

  const updateOrderStatus: AuthContextType['updateOrderStatus'] = async (orderNo, status) => {
    await supabase.from('orders').update({ status }).eq('order_no', orderNo);
  };

  const markOrderAsPrinted: AuthContextType['markOrderAsPrinted'] = async (orderNo) => {
    await supabase.from('orders').update({ printed: true }).eq('order_no', orderNo);
  };

  const getAllSubscribers: AuthContextType['getAllSubscribers'] = async () => {
    const { data } = await supabase.from('subscribers').select('email').eq('is_active', true);
    return (data ?? []).map((s) => s.email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.isAdmin,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        resendVerificationCode,
        resetPassword,
        updatePassword,
        mfaChallenge,
        mfaVerify,
        addAddress,
        removeAddress,
        setDefaultAddress,
        getAllOrders,
        getPendingOrders,
        updateOrderStatus,
        markOrderAsPrinted,
        getAllSubscribers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
