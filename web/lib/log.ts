// Tiny structured logger. Single-line JSON to stdout/stderr so logs flow
// cleanly into Vercel/Datadog/CloudWatch without extra config. Production
// log volume is low enough that we don't need pino's perf yet.

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, msg: string, fields?: Record<string, unknown>) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...(fields ?? {}),
  });
  if (level === "error" || level === "warn") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>) =>
    process.env.NODE_ENV === "development" && emit("debug", msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => emit("info", msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => emit("warn", msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit("error", msg, fields),
};
