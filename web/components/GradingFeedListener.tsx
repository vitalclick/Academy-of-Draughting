"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function GradingFeedListener({ courseFilter }: { courseFilter?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const channel = supabase
      .channel(`grading-feed-${courseFilter ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: "status=eq.submitted",
        },
        () => setPending((c) => c + 1)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "submissions",
          filter: "status=eq.submitted",
        },
        () => setPending((c) => c + 1)
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [courseFilter]);

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span
        className={`mono inline-flex items-center gap-1 ${
          connected ? "text-electric-700" : "text-ink-4"
        }`}
        title={connected ? "Realtime connected" : "Connecting…"}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            connected ? "bg-electric-500" : "bg-ink-4"
          }`}
        />
        {connected ? "LIVE" : "OFFLINE"}
      </span>
      {pending > 0 && (
        <button
          type="button"
          onClick={() => {
            setPending(0);
            router.refresh();
          }}
          className="mono rounded-full bg-amber-500/20 px-3 py-1 text-amber-800 hover:bg-amber-500/30"
        >
          {pending} new {pending === 1 ? "update" : "updates"} · refresh
        </button>
      )}
    </div>
  );
}
