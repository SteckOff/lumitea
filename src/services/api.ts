import { supabase } from '@/lib/supabase';

const LEGACY_API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  // Send contact form via Edge Function
  async sendContact(name: string, email: string, _subject: string, message: string) {
    const { data, error } = await supabase.functions.invoke('send-contact', {
      body: { name, email, message },
    });
    if (error) throw error;
    return data;
  },

  // Subscribe to newsletter — writes to Supabase subscribers table
  async subscribe(email: string) {
    const { error } = await supabase
      .from('subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
    if (error) throw error;
    return { ok: true };
  },

  // Send chat conversation transcript (legacy server)
  async sendChat(email: string, messages: any[], language: string) {
    const response = await fetch(`${LEGACY_API_URL}/api/send-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, messages, language }),
    });
    return response.json();
  },
};
