const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host;
  } catch {
    return '';
  }
})();

/**
 * Content-Security-Policy. Strict by default; opens narrow holes for the
 * specific integrations we use.
 *
 * `'unsafe-inline'` is required in script-src because the App Router emits
 * inline bootstrap/streaming scripts on every page, and these pages are
 * statically generated — so a per-request nonce can't match the prebuilt
 * HTML and content hashes vary per render. These are public pages with no
 * user data, so the weaker script policy is an acceptable trade-off.
 */
function buildCsp() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
  ];
  const connectSrc = [
    "'self'",
    'https://www.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.facebook.com',
    'https://api.anthropic.com',
    'https://api.resend.com',
    'https://api.hubapi.com',
    'https://graph.facebook.com',
  ];
  if (SUPABASE_HOST) {
    scriptSrc.push(`https://${SUPABASE_HOST}`);
    connectSrc.push(`https://${SUPABASE_HOST}`, `wss://${SUPABASE_HOST}`);
  }
  const imgSrc = ["'self'", 'data:', 'blob:', 'https:'];
  const fontSrc = ["'self'", 'data:'];
  const styleSrc = ["'self'", "'unsafe-inline'"];

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `font-src ${fontSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self' ${SITE_URL}`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

const securityHeaders = [
  { key: 'Content-Security-Policy', value: buildCsp() },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/health',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
