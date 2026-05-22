import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/lib/site';

export function Logo({
  tone = 'light',
  height = 44,
}: {
  tone?: 'light' | 'dark';
  height?: number;
}) {
  const src = tone === 'light' ? '/assets/logo-light.png' : '/assets/logo.png';
  return (
    <Link href="/" className="logo" aria-label={SITE.name}>
      <Image
        src={src}
        alt={SITE.name}
        className="logo-img"
        height={height}
        width={Math.round(height * 4)}
        style={{ height, width: 'auto' }}
        priority
      />
    </Link>
  );
}
