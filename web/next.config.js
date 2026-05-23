/** @type {import('next').NextConfig} */

// Build a Content-Security-Policy that is tight enough to matter but does not
// break Next.js' hydration scripts. 'unsafe-inline' on scripts/styles is the
// pragmatic compromise — moving to nonces is a follow-up.
function buildCsp() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseHost = "*.supabase.co";
  try {
    if (supabaseUrl) supabaseHost = new URL(supabaseUrl).host;
  } catch {}

  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
  let sentryOrigin = "";
  try {
    if (sentryDsn) sentryOrigin = new URL(sentryDsn).origin;
  } catch {}

  const connectSrc = [
    "'self'",
    `https://${supabaseHost}`,
    `wss://${supabaseHost}`,
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://challenges.cloudflare.com",
    "https://plausible.io",
    sentryOrigin,
  ]
    .filter(Boolean)
    .join(" ");

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://challenges.cloudflare.com",
    "https://plausible.io",
  ].join(" ");

  const frameSrc = "https://challenges.cloudflare.com";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: buildCsp() },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
};

// Sentry wrap is conditional: only when @sentry/nextjs is resolvable. Missing
// DSN = SDK is a no-op; missing SENTRY_AUTH_TOKEN just skips source-map
// upload. We never want Sentry to break a build.
let exported = nextConfig;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { withSentryConfig } = require("@sentry/nextjs");
  exported = withSentryConfig(nextConfig, {
    silent: !process.env.CI,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: false,
  });
} catch {
  // @sentry/nextjs not installed — proceed with the plain config.
}

module.exports = exported;
