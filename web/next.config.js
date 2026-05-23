/** @type {import('next').NextConfig} */

// Static security headers. The Content-Security-Policy is intentionally NOT
// here — it's set per-request in middleware.ts with a fresh nonce so we can
// drop 'unsafe-inline'/'unsafe-eval' from script-src in favour of
// 'nonce-…' + 'strict-dynamic'.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
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
