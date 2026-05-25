import type { Metadata } from 'next';
import Link from 'next/link';

import { supabaseAdmin } from '@/lib/supabase/server';
import { TEMPLATES } from '@/lib/signatures/templates';
import type { SignatureRow } from '@/types/database';

import { SignatureBuilder } from './builder';
import { InstallInstructions } from './install-instructions';
import { DeleteButton } from './row-delete';

export const metadata: Metadata = {
  title: 'Email signatures',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ id?: string; saved?: string; error?: string }>;

export default async function SignaturesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sb = supabaseAdmin();
  const signatures = sb
    ? (
        await sb
          .from('signatures')
          .select('*')
          .order('full_name', { ascending: true })
      ).data ?? []
    : [];

  const editing: SignatureRow | null =
    (params.id && signatures.find((s) => s.id === params.id)) || null;

  const templateName = (id: string) =>
    TEMPLATES.find((t) => t.id === id)?.name ?? id;

  return (
    <div>
      <div className="admin-header">
        <h1 className="t-h2">Email signatures</h1>
        <p className="t-body" style={{ color: 'var(--ink-3)', marginTop: 8 }}>
          Generate on-brand HTML signatures for the team. Save a signature to keep it on file —
          handy when someone changes role or moves campus and the signature needs regenerating.
        </p>
      </div>

      {params.saved === '1' && (
        <div
          role="status"
          className="apply-banner apply-banner-success"
          style={{ marginBottom: 16 }}
        >
          Signature saved.
        </div>
      )}
      {params.error && (
        <div
          role="alert"
          className="apply-banner apply-banner-error"
          style={{ marginBottom: 16 }}
        >
          {params.error}
        </div>
      )}
      {!sb && (
        <div
          role="alert"
          className="apply-banner apply-banner-error"
          style={{ marginBottom: 16 }}
        >
          Supabase isn&apos;t configured in this environment — signatures can&apos;t be saved
          yet. The builder still works for one-off generation.
        </div>
      )}

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>{editing ? `Editing — ${editing.full_name}` : 'New signature'}</h2>
          {editing && (
            <Link href="/admin/signatures" className="t-mono-xs admin-link">
              CANCEL · START FRESH
            </Link>
          )}
        </div>
        <SignatureBuilder initial={editing} />
      </section>

      <section className="admin-section">
        <InstallInstructions />
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Saved signatures</h2>
          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
            {signatures.length} ON FILE
          </span>
        </div>

        {signatures.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Template</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {signatures.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.full_name}</strong>
                  </td>
                  <td>{s.role}</td>
                  <td>
                    <span className="sig-pill">{templateName(s.template)}</span>
                  </td>
                  <td className="t-mono-xs">
                    {new Date(s.updated_at).toLocaleString('en-ZA')}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link
                      href={`/admin/signatures?id=${s.id}`}
                      className="admin-link"
                      style={{ marginRight: 12 }}
                    >
                      Edit
                    </Link>
                    <DeleteButton id={s.id} name={s.full_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">
            No saved signatures yet. Fill in the form above and click <strong>Save</strong> to
            add one.
          </p>
        )}
      </section>
    </div>
  );
}
