'use client';

import Link from 'next/link';
import { useState } from 'react';
import { track } from '@/lib/analytics/events';
import { COURSES } from '@/data/courses';

type Profile = {
  starting_point: 'matric' | 'working' | 'career_change' | 'student';
  interest: 'mechanical' | 'architectural' | 'civil' | 'bim' | 'not_sure';
  mode: 'full_time' | 'part_time' | 'online' | 'no_preference';
  has_cad_experience: boolean | undefined;
};

const QUESTIONS = [
  {
    key: 'starting_point',
    q: 'Where are you in your journey?',
    options: [
      { value: 'matric', label: 'In matric / Grade 11–12' },
      { value: 'working', label: 'Already working' },
      { value: 'career_change', label: 'Changing careers' },
      { value: 'student', label: 'Studying something else' },
    ],
  },
  {
    key: 'interest',
    q: 'What draws you most?',
    options: [
      { value: 'mechanical', label: 'Mechanical & manufacturing' },
      { value: 'architectural', label: 'Buildings & architecture' },
      { value: 'civil', label: 'Civil & infrastructure' },
      { value: 'bim', label: 'BIM coordination' },
      { value: 'not_sure', label: 'Not sure — surprise me' },
    ],
  },
  {
    key: 'mode',
    q: 'How do you want to study?',
    options: [
      { value: 'full_time', label: 'Full-time · 10 months' },
      { value: 'part_time', label: 'Part-time · 18 months' },
      { value: 'online', label: 'Online · self-paced' },
      { value: 'no_preference', label: 'No preference' },
    ],
  },
  {
    key: 'has_cad_experience',
    q: 'Do you already have CAD experience?',
    options: [
      { value: 'yes', label: 'Yes, some' },
      { value: 'no', label: 'Not really' },
    ],
  },
] as const;

type Ranked = {
  course_id: string;
  title: string;
  score: number;
  duration: string;
  modes: string[];
  software: string[];
};

export function RecommenderQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Profile>>({});
  const [result, setResult] = useState<{ ranked: Ranked[]; top: string; rationale: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(value: string) {
    const q = QUESTIONS[step];
    const next: Partial<Profile> = { ...answers };
    if (q.key === 'has_cad_experience') next.has_cad_experience = value === 'yes';
    else (next as Record<string, string>)[q.key] = value;
    setAnswers(next);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submit(next as Profile);
    }
  }

  async function submit(profile: Profile) {
    setPending(true);
    setError(null);
    track('recommender_started', profile as unknown as Record<string, unknown>);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ranked: Ranked[]; top: string; rationale: string };
      setResult(json);
      track('recommender_completed', { top: json.top, score: json.ranked[0]?.score });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recommender failed');
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
  }

  if (result) {
    const topCourse = COURSES.find((c) => c.id === result.top);
    return (
      <div className="reco-result">
        <span className="t-mono-xs" style={{ color: 'var(--cyan-500)' }}>
          ★ MATCH · {result.ranked[0].score}% FIT
        </span>
        <h2 className="t-h2" style={{ margin: '6px 0 12px' }}>
          {topCourse?.title}
        </h2>
        <p className="t-body-lg" style={{ marginBottom: 16 }}>
          {result.rationale}
        </p>

        <div className="reco-ranks">
          {result.ranked.map((r, i) => (
            <div key={r.course_id} className={`reco-rank ${i === 0 ? 'is-top' : ''}`}>
              <div>
                <div style={{ fontWeight: 500 }}>{r.title}</div>
                <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                  {r.duration} · {r.modes.join(' · ')} · {r.software.join(' · ')}
                </div>
              </div>
              <div className="reco-rank-bar">
                <span className="reco-rank-pct">{r.score}%</span>
                <div className="reco-rank-track">
                  <i style={{ width: `${r.score}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <Link href={`/apply?course=${result.top}`} className="btn btn-primary">
            Apply for {topCourse?.title} →
          </Link>
          <Link href={`/courses/${result.top}`} className="btn btn-ghost-light">
            See full programme
          </Link>
          <button type="button" className="btn btn-ghost-light" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="reco-pending">
        <div className="aida-thinking" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="t-mono-xs" style={{ marginTop: 16, color: 'var(--ink-4)' }}>
          MATCHING YOUR PROFILE TO LIVE PROGRAMME DATA…
        </p>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="reco-quiz">
      <div className="reco-progress">
        <span className="t-mono-xs">
          QUESTION {step + 1} OF {QUESTIONS.length}
        </span>
        <div className="aida-progress-track">
          <div
            className="aida-progress-bar"
            style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="reco-q">{q.q}</h2>
      <div className="reco-opts">
        {q.options.map((o) => (
          <button key={o.value} type="button" className="reco-opt" onClick={() => pick(o.value)}>
            <span>{o.label}</span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      {step > 0 && (
        <button
          type="button"
          className="btn btn-sm btn-ghost-light"
          style={{ marginTop: 16 }}
          onClick={() => setStep(step - 1)}
        >
          ← Back
        </button>
      )}
      {error && (
        <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}
    </div>
  );
}
