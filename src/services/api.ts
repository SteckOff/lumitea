const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  // Send verification code
  async sendVerification(email: string, name: string, code: string) {
    const response = await fetch(`${API_URL}/api/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, code })
    });
    return response.json();
  },

  // Send contact form
  async sendContact(name: string, email: string, subject: string, message: string) {
    const response = await fetch(`${API_URL}/api/send-contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    return response.json();
  },

  // Subscribe to newsletter
  async subscribe(email: string) {
    const response = await fetch(`${API_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  // Send chat conversation
  async sendChat(email: string, messages: any[], language: string) {
    const response = await fetch(`${API_URL}/api/send-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, messages, language })
    });
    return response.json();
  },

  // Send password reset code
  async sendResetCode(email: string, code: string) {
    const response = await fetch(`${API_URL}/api/send-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    return response.json();
  }
};
