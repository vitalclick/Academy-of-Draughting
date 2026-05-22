import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';

const ISSUER = 'aoad.web';
const AUDIENCE = 'aoad.applicant';

function key(): Uint8Array {
  const secret = env.TRACKING_TOKEN_SECRET;
  if (!secret) {
    // Dev-only fallback. Tokens minted here only work within this process.
    return new TextEncoder().encode(
      'dev-only-secret-please-set-TRACKING_TOKEN_SECRET-in-production'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function mintTrackingToken(applicationId: string, ttlDays = 30): Promise<string> {
  return new SignJWT({ sub: applicationId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${ttlDays}d`)
    .sign(key());
}

export async function verifyTrackingToken(token: string): Promise<{ applicationId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: ISSUER, audience: AUDIENCE });
    if (typeof payload.sub !== 'string') return null;
    return { applicationId: payload.sub };
  } catch {
    return null;
  }
}
