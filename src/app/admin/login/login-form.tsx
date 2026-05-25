'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('pending');
    setMessage(null);
    const sb = supabaseBrowser();
    if (!sb) {
      setStatus('error');
      setMessage('Supabase client unavailable.');
      return;
    }
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin/callback` },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div>
        <div className="apply-banner apply-banner-success">
          ✓ Check your inbox — if your email is authorized for admin access, a sign-in link is on
          its way. It expires in 10 minutes.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="exit-modal-form">
      <label className="t-mono-xs">EMAIL</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@academydraughting.com"
        autoComplete="email"
      />
      <button type="submit" className="btn btn-primary" disabled={status === 'pending' || !email}>
        {status === 'pending' ? 'Sending…' : 'Send magic link'}
      </button>
      {status === 'error' && message && (
        <div className="apply-banner apply-banner-error" role="alert">
          {message}
        </div>
      )}
    </form>
  );
}
