"use client";

import { useState, useTransition } from "react";
import {
  createModule,
  updateModule,
  deleteModule,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/app/admin/actions";
import { BriefUploader } from "@/components/BriefUploader";
import type { Assignment, Module } from "@/lib/database.types";

// -- Module editor -----------------------------------------------------------

export function ModuleAdder({
  courseSlug,
  nextOrder,
}: {
  courseSlug: string;
  nextOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(String(nextOrder));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createModule({
          courseSlug,
          title,
          description: description || undefined,
          orderIndex: Number(order),
        });
        setTitle("");
        setDescription("");
        setOrder(String(Number(order) + 1));
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary text-sm"
      >
        + Add module
      </button>
    );
  }
  return (
    <div className="rounded-lg border border-paper-3 bg-white p-4 text-[12px]">
      <div className="mono text-[10px] uppercase text-ink-4">New module</div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_80px]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module title"
          className="rounded border border-paper-3 px-2 py-1.5"
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Order"
          className="rounded border border-paper-3 px-2 py-1.5"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="mt-2 w-full resize-y rounded border border-paper-3 px-2 py-1.5"
      />
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded px-3 py-1 text-ink-3 hover:text-ink-1"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !title.trim()}
          className="rounded bg-electric-600 px-3 py-1 text-white hover:bg-electric-500 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add module"}
        </button>
      </div>
    </div>
  );
}

export function ModuleRow({ module }: { module: Module }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? "");
  const [order, setOrder] = useState(String(module.order_index));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateModule(module.id, {
          title,
          description: description || undefined,
          orderIndex: Number(order),
        });
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function remove() {
    if (!confirm("Delete this module and ALL its assignments + submissions?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteModule(module.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-baseline justify-between">
        <div>
          <span className="mono text-[10px] text-ink-4">#{module.order_index}</span>{" "}
          <span className="font-medium text-ink-1">{module.title}</span>
          {module.description && (
            <p className="mt-1 text-[12px] text-ink-3">{module.description}</p>
          )}
        </div>
        <div className="flex gap-2 text-[11px]">
          <button onClick={() => setEditing(true)} className="text-ink-3 hover:text-ink-1">
            Edit
          </button>
          <button onClick={remove} className="text-red-600 hover:text-red-500" disabled={pending}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded border border-electric-300 bg-paper-1 p-3 text-[12px]">
      <div className="grid gap-2 sm:grid-cols-[1fr_80px]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border border-paper-3 px-2 py-1.5"
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded border border-paper-3 px-2 py-1.5"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-2 w-full resize-y rounded border border-paper-3 px-2 py-1.5"
      />
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => setEditing(false)}
          className="rounded px-3 py-1 text-ink-3 hover:text-ink-1"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={pending}
          className="rounded bg-electric-600 px-3 py-1 text-white hover:bg-electric-500 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// -- Assignment editor -------------------------------------------------------

function isoLocal(value: string | null) {
  if (!value) return "";
  // datetime-local needs YYYY-MM-DDTHH:mm (no tz/seconds)
  return new Date(value).toISOString().slice(0, 16);
}

function fromLocal(value: string) {
  if (!value) return "";
  // Convert the local-naive input back to an ISO string in UTC.
  return new Date(value).toISOString();
}

export function AssignmentAdder({
  moduleId,
  nextOrder,
}: {
  moduleId: string;
  nextOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [order, setOrder] = useState(String(nextOrder));
  const [releaseOffset, setReleaseOffset] = useState("");
  const [dueOffset, setDueOffset] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createAssignment({
          moduleId,
          title,
          description: description || undefined,
          dueAt: fromLocal(dueAt) || undefined,
          maxScore: Number(maxScore),
          orderIndex: Number(order),
          releaseOffsetDays: releaseOffset === "" ? null : Number(releaseOffset),
          dueOffsetDays: dueOffset === "" ? null : Number(dueOffset),
        });
        setTitle("");
        setDescription("");
        setDueAt("");
        setMaxScore("100");
        setOrder(String(Number(order) + 1));
        setReleaseOffset("");
        setDueOffset("");
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mono rounded border border-paper-3 px-2 py-1 text-[11px] text-ink-3 hover:border-electric-400 hover:text-electric-700"
      >
        + Add assignment
      </button>
    );
  }
  return (
    <div className="rounded border border-paper-3 bg-paper-1 p-3 text-[12px]">
      <div className="mono text-[10px] uppercase text-ink-4">New assignment</div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_80px_80px]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded border border-paper-3 bg-white px-2 py-1.5"
        />
        <input
          type="number"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          placeholder="Max"
          className="rounded border border-paper-3 bg-white px-2 py-1.5"
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="Order"
          className="rounded border border-paper-3 bg-white px-2 py-1.5"
        />
      </div>
      <input
        type="datetime-local"
        value={dueAt}
        onChange={(e) => setDueAt(e.target.value)}
        placeholder="Absolute due date (optional, overrides per-cohort offset)"
        className="mt-2 w-full rounded border border-paper-3 bg-white px-2 py-1.5"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="text-[11px] text-ink-3">
          Release offset (days after cohort start)
          <input
            type="number"
            value={releaseOffset}
            onChange={(e) => setReleaseOffset(e.target.value)}
            placeholder="leave blank for day 0"
            className="mt-1 w-full rounded border border-paper-3 bg-white px-2 py-1.5"
          />
        </label>
        <label className="text-[11px] text-ink-3">
          Due offset (days after cohort start)
          <input
            type="number"
            value={dueOffset}
            onChange={(e) => setDueOffset(e.target.value)}
            placeholder="leave blank for none"
            className="mt-1 w-full rounded border border-paper-3 bg-white px-2 py-1.5"
          />
        </label>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="mt-2 w-full resize-y rounded border border-paper-3 bg-white px-2 py-1.5"
      />
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="rounded px-3 py-1 text-ink-3 hover:text-ink-1">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={pending || !title.trim()}
          className="rounded bg-electric-600 px-3 py-1 text-white hover:bg-electric-500 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add"}
        </button>
      </div>
    </div>
  );
}

export function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description ?? "");
  const [dueAt, setDueAt] = useState(isoLocal(assignment.due_at));
  const [maxScore, setMaxScore] = useState(String(assignment.max_score));
  const [order, setOrder] = useState(String(assignment.order_index));
  const [releaseOffset, setReleaseOffset] = useState(
    assignment.release_offset_days == null ? "" : String(assignment.release_offset_days)
  );
  const [dueOffset, setDueOffset] = useState(
    assignment.due_offset_days == null ? "" : String(assignment.due_offset_days)
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateAssignment(assignment.id, {
          title,
          description: description || undefined,
          dueAt: fromLocal(dueAt),
          maxScore: Number(maxScore),
          orderIndex: Number(order),
          releaseOffsetDays: releaseOffset === "" ? null : Number(releaseOffset),
          dueOffsetDays: dueOffset === "" ? null : Number(dueOffset),
        });
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function remove() {
    if (!confirm("Delete this assignment and all submissions for it?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteAssignment(assignment.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  if (!editing) {
    return (
      <li className="rounded border border-paper-3 bg-white px-3 py-2">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-ink-1">
              <span className="mono text-[10px] text-ink-4">#{assignment.order_index}</span>{" "}
              {assignment.title}
            </div>
            <div className="mono text-[11px] text-ink-4">
              max {assignment.max_score}
              {assignment.due_at && (
                <> · due {new Date(assignment.due_at).toLocaleDateString()}</>
              )}
              {assignment.late_penalty_pct_per_day != null &&
                assignment.late_penalty_pct_per_day > 0 && (
                  <> · {assignment.late_penalty_pct_per_day}%/d late</>
                )}
            </div>
          </div>
          <div className="flex gap-2 text-[11px]">
            <button onClick={() => setEditing(true)} className="text-ink-3 hover:text-ink-1">
              Edit
            </button>
            <button onClick={remove} disabled={pending} className="text-red-600 hover:text-red-500">
              Delete
            </button>
          </div>
        </div>
        <BriefUploader assignmentId={assignment.id} currentPath={assignment.brief_storage_path} />
      </li>
    );
  }

  return (
    <li className="rounded border border-electric-300 bg-paper-1 p-3 text-[12px]">
      <div className="grid gap-2 sm:grid-cols-[1fr_80px_80px]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border border-paper-3 bg-white px-2 py-1.5"
        />
        <input
          type="number"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          className="rounded border border-paper-3 bg-white px-2 py-1.5"
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded border border-paper-3 bg-white px-2 py-1.5"
        />
      </div>
      <input
        type="datetime-local"
        value={dueAt}
        onChange={(e) => setDueAt(e.target.value)}
        className="mt-2 w-full rounded border border-paper-3 bg-white px-2 py-1.5"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="text-[11px] text-ink-3">
          Release offset (days)
          <input
            type="number"
            value={releaseOffset}
            onChange={(e) => setReleaseOffset(e.target.value)}
            className="mt-1 w-full rounded border border-paper-3 bg-white px-2 py-1.5"
          />
        </label>
        <label className="text-[11px] text-ink-3">
          Due offset (days)
          <input
            type="number"
            value={dueOffset}
            onChange={(e) => setDueOffset(e.target.value)}
            className="mt-1 w-full rounded border border-paper-3 bg-white px-2 py-1.5"
          />
        </label>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-2 w-full resize-y rounded border border-paper-3 bg-white px-2 py-1.5"
      />
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={() => setEditing(false)} className="rounded px-3 py-1 text-ink-3 hover:text-ink-1">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={pending}
          className="rounded bg-electric-600 px-3 py-1 text-white hover:bg-electric-500 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </li>
  );
}
