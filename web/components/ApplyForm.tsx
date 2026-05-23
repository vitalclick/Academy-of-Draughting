"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { courses } from "@/data/courses";
import { ApplyDocumentSlot } from "@/components/ApplyDocumentUpload";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  courseSlug: string;
  studyMode: "full-time" | "evening" | "online";
  prevQualification?: string;
  notes?: string;
};

export function ApplyForm({ defaultCourse }: { defaultCourse?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      courseSlug: defaultCourse && courses.some((c) => c.slug === defaultCourse) ? defaultCourse : "mddop-n4-n5",
      studyMode: "full-time",
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmittedId(data.id);
      setUploadToken(data.uploadToken ?? null);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "success" && submittedId) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-electric-200 bg-white p-8">
          <span className="eyebrow">APPLICATION RECEIVED</span>
          <h2 className="mt-3 text-2xl font-medium">Thanks — you're in.</h2>
          <p className="mt-3 text-ink-3">
            Your reference is{" "}
            <span className="font-mono text-ink">{submittedId}</span>. Admissions
            will be in touch within one working day on WhatsApp.
          </p>
        </div>

        {uploadToken && (
          <div className="rounded-xl border border-paper-3 bg-white p-8">
            <span className="eyebrow">SPEED UP YOUR REVIEW</span>
            <h3 className="mt-3 text-xl font-medium">Upload your documents now</h3>
            <p className="mt-2 text-sm text-ink-3">
              We need these to assess your application. Upload them in the next 24
              hours and admissions can decide on the same day. Otherwise, you can
              create an account later and upload from the student portal.
            </p>
            <div className="mt-5 grid gap-3">
              <ApplyDocumentSlot
                applicationId={submittedId}
                uploadToken={uploadToken}
                kind="id"
                label="South African ID or passport"
                required
                hint="PDF or photo · clear and readable"
              />
              <ApplyDocumentSlot
                applicationId={submittedId}
                uploadToken={uploadToken}
                kind="qualification"
                label="Highest qualification certificate (matric or higher)"
                required
                hint="PDF preferred · we'll OCR it automatically"
              />
              <ApplyDocumentSlot
                applicationId={submittedId}
                uploadToken={uploadToken}
                kind="portfolio"
                label="Portfolio or sample drawings (optional)"
                hint="If you have prior CAD work, attach a PDF or image"
              />
            </div>
            <p className="mt-4 text-[11px] text-ink-4">
              By uploading you confirm these documents are yours and may be processed
              for admissions. See our{" "}
              <a href="/privacy" className="text-electric-700 underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-paper-3 bg-white p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input className="input" {...register("fullName", { required: "Required", minLength: { value: 2, message: "Too short" } })} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" className="input" {...register("email", { required: "Required" })} />
        </Field>
        <Field label="Phone (WhatsApp)" error={errors.phone?.message}>
          <input className="input" placeholder="+27 …" {...register("phone", { required: "Required" })} />
        </Field>
        <Field label="Previous qualification (optional)">
          <input className="input" {...register("prevQualification")} />
        </Field>
        <Field label="Course">
          <select className="input" {...register("courseSlug", { required: true })}>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Study mode">
          <select className="input" {...register("studyMode", { required: true })}>
            <option value="full-time">Full-time</option>
            <option value="evening">Evening</option>
            <option value="online">Online</option>
          </select>
        </Field>
        <Field label="Notes (optional)" full>
          <textarea rows={4} className="input" {...register("notes")} />
        </Field>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12px] text-ink-4">By submitting, you agree to be contacted by admissions. POPIA-compliant.</p>
        <button type="submit" disabled={status === "submitting"} className="btn-primary disabled:opacity-50">
          {status === "submitting" ? "Submitting…" : "Submit application →"}
        </button>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--paper-3,#DCE3EF);border-radius:6px;padding:10px 12px;font-size:14px;outline:none;background:white;color:inherit}.input:focus{border-color:#2D6FF7}`}</style>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  full,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mono text-ink-4">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-[12px] text-red-600">{error}</span>}
    </label>
  );
}
