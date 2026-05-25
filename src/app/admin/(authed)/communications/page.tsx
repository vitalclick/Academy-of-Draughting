import Link from 'next/link';
import { listContacts, getContactDetail, type ContactRow } from '@/lib/db/admin';
import type { EventRow } from '@/types/database';

export const dynamic = 'force-dynamic';

function contactName(c: { first_name: string | null; last_name: string | null; email: string }) {
  return `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.email;
}

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function humaniseEvent(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function eventDot(name: string) {
  if (/submitted|completed|accepted|captured/.test(name)) return 'cyan';
  if (/failed|rejected|error/.test(name)) return 'red';
  if (/changed|review/.test(name)) return 'warn';
  return '';
}

function ContactList({ contacts, activeId }: { contacts: ContactRow[]; activeId: string | null }) {
  return (
    <div className="comm-list">
      <div className="adm-toolbar">
        <div className="adm-tabs">
          <span className="adm-tab is-active">
            Contacts <span className="count">{contacts.length}</span>
          </span>
        </div>
      </div>
      {contacts.length === 0 ? (
        <p style={{ padding: 16, color: 'var(--ink-4)', fontSize: 13 }}>No contacts yet.</p>
      ) : (
        contacts.map((c) => {
          const name = contactName(c);
          const isLead = !c.application_id;
          return (
            <Link
              key={c.id}
              href={`/admin/communications?id=${c.id}`}
              className={`comm-item ${activeId === c.id ? 'is-active' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="av">{initialsOf(name)}</span>
              <div style={{ minWidth: 0 }}>
                <div className="comm-item-head">
                  <span className="comm-item-name">{name}</span>
                  <span className="comm-item-time">
                    {c.last_activity ? new Date(c.last_activity).toLocaleDateString('en-ZA') : ''}
                  </span>
                </div>
                <div className="comm-item-prev">{c.email}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`ch ${isLead ? 'sm' : 'em'}`}>{isLead ? 'LEAD' : 'APPLICANT'}</span>
                  {c.event_count > 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)' }}>
                      {c.event_count} event{c.event_count === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

function ContactDetail({
  detail,
}: {
  detail: { applicant: { first_name: string | null; last_name: string | null; email: string; phone: string | null; city: string | null }; application: { id: string; status: string } | null; events: EventRow[] };
}) {
  const name = contactName(detail.applicant);
  const phone = detail.applicant.phone;
  const waNumber = phone ? phone.replace(/[^0-9]/g, '') : null;

  return (
    <div className="comm-thread">
      <div className="comm-thread-head">
        <div className="comm-thread-h-l">
          <span
            className="av"
            style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--paper-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}
          >
            {initialsOf(name)}
          </span>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>{name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.04em' }}>
              {detail.applicant.email}
              {phone ? ` · ${phone}` : ''}
              {detail.applicant.city ? ` · ${detail.applicant.city}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {detail.application && (
            <Link href={`/admin/applications/${detail.application.id}`} className="btn btn-sm btn-ghost-light">
              Open application
            </Link>
          )}
        </div>
      </div>

      <div className="comm-thread-body" style={{ display: 'block' }}>
        <div className="adm-card-sub" style={{ marginBottom: 12 }}>Activity timeline</div>
        {detail.events.length === 0 ? (
          <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>No recorded activity for this contact yet.</p>
        ) : (
          <div className="adm-activity">
            {detail.events.map((ev) => (
              <div key={ev.id} className="adm-act">
                <span className={`adm-act-dot ${eventDot(ev.name)}`} />
                <div className="adm-act-msg">
                  <strong>{humaniseEvent(ev.name)}</strong>
                  {ev.application_id && <span className="meta"> · application</span>}
                </div>
                <span className="adm-act-time">{new Date(ev.occurred_at).toLocaleString('en-ZA')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="comm-input" style={{ alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12.5, color: 'var(--ink-4)', flex: 1 }}>
          Reach out directly — sending from here isn&apos;t wired up yet.
        </span>
        <a href={`mailto:${detail.applicant.email}`} className="btn btn-sm btn-ghost-light">
          Email ↗
        </a>
        {waNumber && (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary"
          >
            WhatsApp ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default async function CommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const contacts = await listContacts({ limit: 100 });
  const activeId = id ?? contacts[0]?.id ?? null;
  const detail = activeId ? await getContactDetail(activeId) : null;

  const leads = contacts.filter((c) => !c.application_id).length;
  const withApps = contacts.length - leads;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>COMMUNICATIONS
          </div>
          <h1>Communications</h1>
          <p>
            {contacts.length} contact{contacts.length === 1 ? '' : 's'} · {leads} lead
            {leads === 1 ? '' : 's'} · {withApps} with applications
          </p>
        </div>
      </div>

      <div className="comm-grid">
        <ContactList contacts={contacts} activeId={activeId} />
        {detail ? (
          <ContactDetail detail={detail} />
        ) : (
          <div className="comm-thread">
            <div className="comm-thread-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--ink-4)', fontSize: 14 }}>
                {contacts.length === 0 ? 'No contacts to show yet.' : 'Select a contact to view their activity.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
