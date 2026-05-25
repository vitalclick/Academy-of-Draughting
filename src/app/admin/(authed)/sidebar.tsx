'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

type NavItem = { sec: string } | { k: string; l: string; ic: string; href: string; count?: number; urgent?: boolean };

const NAV: NavItem[] = [
  { sec: 'OPERATIONS' },
  { k: 'overview', l: 'Overview', ic: '◫', href: '/admin' },
  { k: 'applications', l: 'Applications', ic: '◇', href: '/admin/applications', count: 0, urgent: true },
  { k: 'leads', l: 'Leads', ic: '◍', href: '/admin/leads' },
  { k: 'students', l: 'Students', ic: '◉', href: '/admin/students' },
  { k: 'communications', l: 'Communications', ic: '✉', href: '/admin/communications' },
  { sec: 'ACADEMIC' },
  { k: 'programmes', l: 'Programmes', ic: '◰', href: '/admin/programmes' },
  { sec: 'CONTENT' },
  { k: 'content', l: 'Content Studio', ic: '✎', href: '/admin/content' },
  { k: 'signatures', l: 'Email signatures', ic: '⊞', href: '/admin/signatures' },
  { k: 'events', l: 'Events', ic: '⊡', href: '/admin/events' },
  { sec: 'FINANCE' },
  { k: 'finance', l: 'Payments', ic: 'R', href: '/admin/finance' },
  { k: 'reports', l: 'Reports', ic: '⌗', href: '/admin/reports' },
  { sec: 'SETTINGS' },
  { k: 'settings', l: 'Settings', ic: '⚙', href: '/admin/settings' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  email,
  role,
  applicationsCount,
  studentsCount,
}: {
  email: string;
  role: string;
  applicationsCount: number;
  studentsCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const initials = email.slice(0, 2).toUpperCase();

  async function signOut() {
    setSigningOut(true);
    const sb = supabaseBrowser();
    if (sb) await sb.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="admin-side">
      <div className="admin-side-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-light.png" alt="Academy of Advanced Draughting" />
      </div>
      <div className="admin-side-brand" style={{ padding: '10px 20px' }}>
        <div className="admin-side-brand-meta">
          <span className="t-mono-xs">CONSOLE</span>
          <span className="as-env">Admissions &amp; Operations</span>
        </div>
      </div>

      {NAV.map((item, i) => {
        if ('sec' in item) {
          return (
            <div key={`sec-${i}`} className="admin-side-sec">
              {item.sec}
            </div>
          );
        }
        const count =
          item.k === 'applications'
            ? applicationsCount
            : item.k === 'students'
              ? studentsCount
              : item.count;
        return (
          <Link
            key={item.k}
            href={item.href}
            className={`admin-side-link ${isActive(pathname, item.href) ? 'is-active' : ''}`}
          >
            <span className="icn">{item.ic}</span>
            <span>{item.l}</span>
            {count != null && count > 0 && (
              <span className={`count ${item.urgent ? 'urgent' : ''}`}>{count}</span>
            )}
          </Link>
        );
      })}

      <div className="admin-side-foot">
        <span className="av">{initials}</span>
        <div className="who">
          <div className="who-name">{email}</div>
          <div className="who-role">{role.toUpperCase()}</div>
        </div>
        <button type="button" className="signout" onClick={signOut} disabled={signingOut}>
          {signingOut ? '…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
