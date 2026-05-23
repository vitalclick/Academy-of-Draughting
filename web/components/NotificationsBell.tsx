"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    try {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("notifications")
        .select("id, kind, title, body, link, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(15)
        .returns<Notification[]>();
      setItems(data ?? []);
      setLoaded(true);
    } catch {
      // No-op if Supabase env missing or user not signed in.
    }
  }

  useEffect(() => {
    void refresh();
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel("notifications-self")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => void refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        () => void refresh()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const unread = items.filter((n) => !n.read_at).length;

  async function markAll() {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    void refresh();
  }

  async function markOne(id: string) {
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    void refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative grid h-9 w-9 place-items-center rounded-md text-ink-2 hover:bg-paper"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-electric-600 px-1 text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-lg border border-paper-3 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-paper-2 px-3 py-2">
            <span className="mono text-[11px] uppercase text-ink-3">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-[11px] text-electric-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <div className="px-3 py-6 text-center text-[12px] text-ink-3">Loading…</div>
            ) : items.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-ink-3">Nothing yet.</div>
            ) : (
              <ul className="divide-y divide-paper-2 text-sm">
                {items.map((n) => {
                  const dot = !n.read_at ? "bg-electric-500" : "bg-transparent";
                  const inner = (
                    <div
                      className={`flex items-start gap-2 px-3 py-2 hover:bg-paper ${
                        n.read_at ? "" : "bg-electric-50/40"
                      }`}
                    >
                      <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-ink-1">{n.title}</div>
                        {n.body && (
                          <div className="mt-0.5 text-[12px] text-ink-3">{n.body}</div>
                        )}
                        <div className="mono mt-1 text-[10px] uppercase text-ink-4">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id} onClick={() => !n.read_at && void markOne(n.id)}>
                      {n.link ? (
                        <Link href={n.link} className="block">
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
