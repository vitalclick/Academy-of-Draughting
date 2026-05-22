import 'server-only';
import { env, features, isProduction } from '@/lib/env';

type Level = 'info' | 'warn' | 'error';

type Context = Record<string, unknown>;

/**
 * Capture an error or noteworthy event. Posts to ERROR_SINK_URL if configured,
 * always console-logs. Never throws.
 *
 * The sink endpoint receives JSON of the form:
 *   { level, message, timestamp, env, context }
 *
 * Compatible with Sentry's "Store API" (set ERROR_SINK_URL to your DSN URL
 * with sentry_key + sentry_version params), Slack/Discord webhooks, or a
 * custom HTTP endpoint.
 */
export async function captureError(
  message: string,
  err: unknown,
  context: Context = {}
): Promise<void> {
  const level: Level = 'error';
  const enriched = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: isProduction ? 'production' : 'development',
    context: {
      ...context,
      error_message: err instanceof Error ? err.message : String(err),
      error_stack: err instanceof Error ? err.stack : undefined,
    },
  };

  console.error(`[capture] ${message}`, enriched.context.error_message);

  if (!features.errorSink) return;

  try {
    await fetch(env.ERROR_SINK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.ERROR_SINK_TOKEN ? { Authorization: `Bearer ${env.ERROR_SINK_TOKEN}` } : {}),
      },
      body: JSON.stringify(enriched),
      // Don't hold up the request on a slow sink
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // ignore — observability must never break a request
  }
}

export async function captureWarn(message: string, context: Context = {}): Promise<void> {
  console.warn(`[capture] ${message}`, context);
  if (!features.errorSink) return;
  try {
    await fetch(env.ERROR_SINK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.ERROR_SINK_TOKEN ? { Authorization: `Bearer ${env.ERROR_SINK_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        level: 'warn' as Level,
        message,
        timestamp: new Date().toISOString(),
        env: isProduction ? 'production' : 'development',
        context,
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // ignore
  }
}
