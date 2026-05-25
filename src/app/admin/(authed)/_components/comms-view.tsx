'use client';

import { useState } from 'react';

const THREADS = [
  { id: 1, initials: 'BP', name: 'Brandon Pieterse', ch: 'wa', time: '14m', prev: 'Thanks — what does the Revit short course cost...', unread: true, app: 'APP-2043' },
  { id: 2, initials: 'AN', name: 'Aisha Naidoo', ch: 'em', time: '1h', prev: 'Hi, my matric upload keeps failing. Can I send it via...', unread: true, app: 'APP-2044' },
  { id: 3, initials: 'LK', name: 'Lerato Khumalo', ch: 'wa', time: '2h', prev: 'Confirmed — see you Monday at 8am!', unread: false, app: 'APP-2046' },
  { id: 4, initials: 'TM', name: 'Thandi Mokoena', ch: 'em', time: '4h', prev: 'Re: Offer accepted. I will be at JHB campus on...', unread: false, app: 'APP-2041' },
  { id: 5, initials: 'JV', name: 'Jacques van Wyk', ch: 'em', time: '1d', prev: 'Could you send the Inventor module breakdown?', unread: false, app: 'APP-2040' },
  { id: 6, initials: 'ZM', name: 'Zinhle Mokoena', ch: 'wa', time: '1d', prev: 'Hello — I would like to apply for the bridging...', unread: false, app: 'APP-2042' },
  { id: 7, initials: 'KP', name: 'Karabo Phiri', ch: 'sm', time: '2d', prev: 'SMS · Auto-reminder: application status update', unread: false, app: null },
  { id: 8, initials: 'RM', name: 'Riaan Müller', ch: 'em', time: '2d', prev: 'Employer wants to pay upfront. Where do I send...', unread: false, app: 'APP-2038' },
] as const;

const CH_LABEL: Record<string, string> = { wa: 'WHATSAPP', em: 'EMAIL', sm: 'SMS' };

export function CommsView() {
  const [active, setActive] = useState(1);
  const thread = THREADS.find((t) => t.id === active) ?? THREADS[0];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>COMMUNICATIONS
          </div>
          <h1>Communications</h1>
          <p>Illustrative · 12 unread · 4 WhatsApp · 8 email.</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Templates</button>
          <button type="button" className="btn btn-sm btn-primary">+ New message</button>
        </div>
      </div>

      <div className="comm-grid">
        <div className="comm-list">
          <div className="adm-toolbar">
            <div className="adm-tabs">
              <button type="button" className="adm-tab is-active">
                Inbox <span className="count">12</span>
              </button>
              <button type="button" className="adm-tab">Sent</button>
              <button type="button" className="adm-tab">Archived</button>
            </div>
          </div>
          {THREADS.map((t) => (
            <div
              key={t.id}
              className={`comm-item ${active === t.id ? 'is-active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              <span className="av">{t.initials}</span>
              <div style={{ minWidth: 0 }}>
                <div className="comm-item-head">
                  <span className="comm-item-name">{t.name}</span>
                  <span className="comm-item-time">{t.time}</span>
                </div>
                <div className="comm-item-prev">{t.prev}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`ch ${t.ch}`}>{CH_LABEL[t.ch]}</span>
                  {t.app && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)' }}>{t.app}</span>
                  )}
                </div>
              </div>
              {t.unread && <span className="unread" />}
            </div>
          ))}
        </div>

        <div className="comm-thread">
          <div className="comm-thread-head">
            <div className="comm-thread-h-l">
              <span className="av" style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--paper-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                {thread.initials}
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500 }}>{thread.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.04em' }}>
                  {thread.ch === 'wa' ? 'WHATSAPP · +27 71 555 0119' : thread.ch === 'em' ? 'EMAIL' : 'SMS'}
                  {thread.app && <> · {thread.app}</>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn btn-sm btn-ghost-light">Archive</button>
            </div>
          </div>

          <div className="comm-thread-body">
            <div className="comm-msg">
              Hi, I&apos;m interested in the Revit Architecture short course but the website only shows the
              duration. Could you send me the full price list and the next intake dates? My employer will
              be paying.
              <div className="meta">14:18 · WhatsApp</div>
            </div>
            <div className="comm-msg me">
              Hi Brandon — happy to help. The Revit short course runs 10 weeks online, R 8,400 if paid
              upfront or R 950/month over 9 months. Next intake is 1 May 2026.
              <div className="meta">14:22 · Sent</div>
            </div>
            <div className="comm-msg me">
              For employer billing I&apos;ll send a pro-forma invoice — what&apos;s their company name and
              VAT number?
              <div className="meta">14:22 · Sent</div>
            </div>
            <div className="comm-msg">
              Thanks — what does the Revit short course cost for employer billing? Need to send PO this
              week.
              <div className="meta">14:32 · WhatsApp</div>
            </div>
          </div>

          <div className="comm-input">
            <textarea placeholder={`Reply to ${thread.name}…`} defaultValue="" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button type="button" className="btn btn-sm btn-primary">Send →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
