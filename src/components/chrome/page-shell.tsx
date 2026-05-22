import type { ReactNode } from 'react';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';
import type { NavKey } from '@/lib/site';

export function PageShell({
  active,
  headerTone = 'dark',
  children,
}: {
  active: NavKey;
  headerTone?: 'dark' | 'light';
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader active={active} tone={headerTone} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
