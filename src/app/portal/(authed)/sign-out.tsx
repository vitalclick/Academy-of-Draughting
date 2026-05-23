'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function PortalSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const sb = supabaseBrowser();
    if (sb) await sb.auth.signOut();
    router.push('/portal/login');
    router.refresh();
  }

  return (
    <button type="button" className="t-mono-xs admin-link" onClick={signOut} disabled={pending}>
      {pending ? 'SIGNING OUT…' : 'SIGN OUT'}
    </button>
  );
}
