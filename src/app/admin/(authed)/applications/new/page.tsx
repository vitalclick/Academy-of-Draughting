import Link from 'next/link';
import { ApplicationForm } from './application-form';
import { BulkImport } from './bulk-import';
import {
  CAMPUS_OPTIONS,
  FUNDING_OPTIONS,
  MODE_OPTIONS,
  PROGRAMME_OPTIONS,
  STATUS_OPTIONS,
} from './options';

function Ref({ label, values }: { label: string; values: string[] }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {values.map((v) => (
          <code
            key={v}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--paper)', border: '1px solid var(--line-on-light-2)', borderRadius: 4, padding: '1px 6px', color: 'var(--ink-2)' }}
          >
            {v}
          </code>
        ))}
      </div>
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>APPLICATIONS<span className="sep">/</span>NEW
          </div>
          <h1>New application</h1>
          <p>Add a single application, or bulk import many from a CSV file.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/applications" className="btn btn-sm btn-ghost-light">
            ← Back to applications
          </Link>
        </div>
      </div>

      <div className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Single application</h3>
              <div className="adm-card-sub">Create one record</div>
            </div>
          </div>
          <ApplicationForm />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <h3 className="adm-card-title">Bulk import</h3>
                <div className="adm-card-sub">CSV upload</div>
              </div>
            </div>
            <BulkImport />
          </div>

          <div className="adm-card">
            <div className="adm-card-head">
              <div>
                <h3 className="adm-card-title">Field reference</h3>
                <div className="adm-card-sub">Accepted values</div>
              </div>
            </div>
            <div className="adm-card-body">
              <Ref label="programme" values={PROGRAMME_OPTIONS.map((p) => p.value)} />
              <Ref label="mode" values={MODE_OPTIONS} />
              <Ref label="campus" values={CAMPUS_OPTIONS} />
              <Ref label="funding_plan" values={FUNDING_OPTIONS.map((f) => f.value)} />
              <Ref label="status (optional, default submitted)" values={STATUS_OPTIONS} />
              <p style={{ fontSize: 12.5, color: 'var(--ink-4)', margin: '8px 0 0', lineHeight: 1.5 }}>
                Required columns: <code style={{ fontFamily: 'var(--font-mono)' }}>email, programme, mode, campus, funding_plan</code>. Everything else is optional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
