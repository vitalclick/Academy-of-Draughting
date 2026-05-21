/* ============================================================
   Site chrome — Header, Footer, AI Chat widget, page shell
   ============================================================ */

const SITE = {
  name: 'The Academy of Advanced Draughting',
  short: 'The Academy of Advanced Draughting',
  established: 1981,
  email: 'enroll@academydraughting.com',
  phone: '+27 68 110 0746',
  whatsappJhb: 'WhatsApp Johannesburg',
  whatsappDbn: 'WhatsApp Durban',
};

const NAV_ITEMS = [
  { key: 'home',     label: 'Home',     href: 'index.html' },
  { key: 'courses',  label: 'Courses',  href: 'courses.html' },
  { key: 'about',    label: 'About',    href: 'about.html' },
  { key: 'apply',    label: 'Apply',    href: 'apply.html' },
  { key: 'portal',   label: 'Student Portal', href: 'portal.html' },
];

/* ------------------------------------------------------------
   Logo — original wordmark for the redesign.
   Square mark with a stylized "A" built from drafting strokes,
   set next to a 2-line wordmark in Geist.
   ------------------------------------------------------------ */

function Logo({ tone = 'light', height = 44 }) {
  // tone: 'light' = on dark bg → uses logo-light.png; 'dark' = on light bg → uses logo.png
  const src = tone === 'light' ? 'assets/logo-light.png' : 'assets/logo.png';
  return (
    <a href="index.html" className="logo" aria-label={SITE.name}>
      <img
        src={src}
        alt={SITE.name}
        className="logo-img"
        style={{ height: height, width: 'auto' }}
      />
    </a>
  );
}

/* ------------------------------------------------------------
   Top utility strip + main nav
   ------------------------------------------------------------ */

function SiteHeader({ active = 'home', tone = 'dark' }) {
  // tone: 'dark' header (for light pages) or 'light' header (for dark hero pages)
  const isDark = tone === 'dark';
  const [open, setOpen] = React.useState(false);

  return (
    <header className={`site-header ${isDark ? 'sh-dark' : 'sh-light'}`}>
      <div className="util-strip">
        <div className="page util-row">
          <div className="util-left">
            <span className="t-mono-sm util-item">
              <span className="util-glyph" aria-hidden="true">◇</span>
              {SITE.email}
            </span>
            <span className="util-item">
              <span className="util-glyph" aria-hidden="true">◇</span>
              <span className="t-mono-sm">{SITE.phone}</span>
            </span>
          </div>
          <div className="util-right">
            <span className="util-item util-status">
              <span className="util-pulse" aria-hidden="true"></span>
              <span className="t-mono-sm">2026 INTAKE · OPEN</span>
            </span>
            <a href="apply.html" className="util-item util-link"><span className="t-mono-sm">APPLY ONLINE →</span></a>
          </div>
        </div>
      </div>

      <div className="page nav-row">
        <Logo tone={isDark ? 'light' : 'dark'} />

        <nav className="nav-main" aria-label="Main">
          {NAV_ITEMS.map(item => (
            <a
              key={item.key}
              href={item.href}
              className={`nav-link ${active === item.key ? 'is-active' : ''}`}
            >
              {item.label}
              {active === item.key && <span className="nav-underline" aria-hidden="true"></span>}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-sm btn-ghost-light nav-ai-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('aida:open'))}
          >
            <span>Admissions Chat</span>
          </button>
          <a href="apply.html" className="btn btn-sm btn-primary">
            Apply Now <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>

        <button
          type="button"
          className="nav-burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          <div className="page">
            {NAV_ITEMS.map(item => (
              <a key={item.key} href={item.href} className={`nm-link ${active === item.key ? 'is-active' : ''}`}>
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </a>
            ))}
            <div className="nm-actions">
              <button type="button" className="btn btn-ghost-light" onClick={() => { window.dispatchEvent(new CustomEvent('aida:open')); setOpen(false); }}>
                Admissions Chat
              </button>
              <a href="apply.html" className="btn btn-primary">Apply Now</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------
   Footer
   ------------------------------------------------------------ */

function SiteFooter() {
  return (
    <footer className="site-footer section-darker">
      <div className="page">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo tone="light" />
            <p className="t-body" style={{ marginTop: 20, maxWidth: 380, color: 'var(--ink-on-dark-2)' }}>
              Specialist draughting education since 1981. Career-focused training aligned to real engineering and design office environments.
            </p>
            <div className="footer-creds">
              <span className="pill pill-dark"><span className="dot"></span>DHET registered</span>
              <span className="pill pill-dark"><span className="dot"></span>QCTO aligned</span>
              <span className="pill pill-dark"><span className="dot"></span>SAQA 66881</span>
            </div>
          </div>

          <div className="footer-cols">
            <FooterCol title="Study">
              <a href="courses.html">MDDOP N4/N5</a>
              <a href="courses.html">Bridging Course</a>
              <a href="courses.html">CAD Short Courses</a>
              <a href="courses.html">Online / Distance Learning</a>
              <a href="courses.html">FAQ</a>
            </FooterCol>

            <FooterCol title="Apply">
              <a href="apply.html">Start Application</a>
              <a href="apply.html">Funding & Payment</a>
              <a href="apply.html">Entry Requirements</a>
              <a href="apply.html">Intake Dates</a>
            </FooterCol>

            <FooterCol title="Campus">
              <a href="about.html">Johannesburg</a>
              <a href="about.html">Durban</a>
              <a href="about.html">Online · Nationwide</a>
              <a href="about.html">Visit Us</a>
            </FooterCol>

            <FooterCol title="Resources">
              <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('aida:open')); }}>Admissions Chat</a>
              <a href="apply.html">Career Counsellor</a>
              <a href="portal.html">Student Portal</a>
              <a href="courses.html">Programme Recommender</a>
            </FooterCol>
          </div>
        </div>

        <div className="footer-mid">
          <div className="footer-contact">
            <a href="https://wa.me/27000000000" className="btn btn-sm btn-ghost-dark"><WaIcon />WhatsApp Johannesburg</a>
            <a href="https://wa.me/27000000000" className="btn btn-sm btn-ghost-dark"><WaIcon />WhatsApp Durban</a>
            <a href={`mailto:${SITE.email}`} className="btn btn-sm btn-ghost-dark">{SITE.email}</a>
            <a href={`tel:${SITE.phone.replace(/\s/g,'')}`} className="btn btn-sm btn-ghost-dark">{SITE.phone}</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="fb-left">
            <span className="t-mono-sm" style={{ color: 'var(--ink-on-dark-3)' }}>
              © {SITE.established}—2026 The Academy of Advanced Draughting. All rights reserved.
            </span>
          </div>
          <div className="fb-right">
            <a href="#" className="t-mono-sm">Privacy</a>
            <a href="#" className="t-mono-sm">Terms</a>
            <a href="#" className="t-mono-sm">POPIA</a>
            <span className="t-mono-sm" style={{ color: 'var(--ink-on-dark-3)' }}>v3.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div className="footer-col">
      <h4 className="t-mono-xs footer-col-title">{title}</h4>
      <div className="footer-col-links">{children}</div>
    </div>
  );
}

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.4 3.6A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.2zM12 21.7h-.01a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.9-9.8 2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.5-4.4 9.9-9.9 9.9zm5.4-7.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/>
    </svg>
  );
}

/* ------------------------------------------------------------
   AIDA — AI Admissions Assistant (mock chat widget)
   Floating button bottom-right; expands to a panel.
   ------------------------------------------------------------ */

const AIDA_THREAD = [
  { role: 'aida', text: "Hi, I'm AIDA — your admissions assistant. Tell me where you are right now and I'll match you to the right pathway." },
  { role: 'aida', kind: 'chips', chips: [
    "I'm in matric / Grade 11–12",
    "I'm changing careers",
    "I want to upgrade my CAD skills",
    "I'm not sure yet",
  ]},
];

function AidaWidget() {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState('chat'); // chat | match | apply
  const [thread, setThread] = React.useState(AIDA_THREAD);
  const [input, setInput] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('aida:open', onOpen);
    return () => window.removeEventListener('aida:open', onOpen);
  }, []);

  React.useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView ? null : null;
    if (endRef.current) {
      // safe scroll within the panel only
      const parent = endRef.current.parentElement;
      if (parent) parent.scrollTop = parent.scrollHeight;
    }
  }, [thread, thinking]);

  function send(text) {
    if (!text) return;
    setThread(t => [...t, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setThread(t => [...t, scriptedReply(text)]);
    }, 850);
  }

  function scriptedReply(text) {
    const t = text.toLowerCase();
    if (t.includes('matric') || t.includes('grade')) {
      return { role: 'aida', text: "Good — most matric / Grade 11–12 students start with MDDOP N4/N5 (10 months full-time). It's nationally examined and you don't need prior CAD experience. Want me to start your application?", kind: 'chips', chips: ['Start application', 'See MDDOP details', 'Bridging course?'] };
    }
    if (t.includes('career') || t.includes('chang')) {
      return { role: 'aida', text: "Career changers usually do well in our part-time MDDOP (18 months) or the Bridging Course if maths is rusty. I can map your background to a path — paste your current role or upload your CV.", kind: 'chips', chips: ['Upload CV', 'Take career quiz', 'Talk to admissions'] };
    }
    if (t.includes('cad') || t.includes('autocad') || t.includes('revit') || t.includes('inventor')) {
      return { role: 'aida', text: "For working professionals upgrading CAD, the short courses are usually right — AutoCAD, Revit, or Inventor. Flexible schedules, industry-standard software, practical project work. Which software is your priority?", kind: 'chips', chips: ['AutoCAD', 'Revit', 'Inventor', 'All three'] };
    }
    if (t.includes('apply') || t.includes('start')) {
      return { role: 'aida', text: "Let's start your application. It's a 4-step process — about 6 minutes. I'll prefill what I can from our chat.", kind: 'cta', ctaHref: 'apply.html', ctaLabel: 'Open application →' };
    }
    return { role: 'aida', text: "Tell me a bit more — your background, what you want to draw (mechanical, architectural, civil), or where you'd like to study (Johannesburg, Durban, online).", kind: 'chips', chips: ['Mechanical', 'Architectural', 'Civil', 'Online study'] };
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className="aida-fab"
          onClick={() => setOpen(true)}
          aria-label="Open AIDA admissions assistant"
        >
          <span className="aida-fab-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3.93-7.44L21 3l-1.06 4.06A9 9 0 0 1 21 12z" stroke="currentColor" strokeWidth="1.5"/></svg>
          </span>
          <span className="aida-fab-text">
            <span className="aida-fab-title">Admissions Chat</span>
            <span className="aida-fab-sub">Live · &lt;1 min reply</span>
          </span>
        </button>
      )}

      {open && (
        <div className="aida-panel" role="dialog" aria-label="AIDA admissions assistant">
          <header className="aida-head">
            <div className="aida-head-left">
              <span className="aida-avatar" aria-hidden="true">
                <span className="ai-dot"></span>
              </span>
              <div className="aida-head-text">
                <div className="aida-head-name">Admissions · AIDA</div>
                <div className="aida-head-sub t-mono-xs">ONLINE · &lt;1 MIN AVG REPLY</div>
              </div>
            </div>
            <button type="button" className="aida-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </header>

          <div className="aida-tabs">
            {[
              { k: 'chat',  label: 'Chat' },
              { k: 'match', label: 'Match Pathway' },
              { k: 'apply', label: 'Apply' },
            ].map(t => (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className={`aida-tab ${tab === t.k ? 'is-active' : ''}`}
              >{t.label}</button>
            ))}
          </div>

          {tab === 'chat' && (
            <>
              <div className="aida-body">
                {thread.map((m, i) => (
                  <AidaMessage key={i} m={m} onChip={send} />
                ))}
                {thinking && (
                  <div className="aida-msg aida-msg-ai">
                    <div className="aida-bubble aida-thinking"><span></span><span></span><span></span></div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <form
                className="aida-input"
                onSubmit={(e) => { e.preventDefault(); send(input.trim()); }}
              >
                <input
                  type="text"
                  placeholder="Tell AIDA where you are…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" aria-label="Send" disabled={!input.trim()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </form>
              <div className="aida-foot t-mono-xs">
                Mock prototype &middot; responses are illustrative
              </div>
            </>
          )}

          {tab === 'match' && <AidaMatchView />}
          {tab === 'apply' && <AidaApplyView />}
        </div>
      )}
    </>
  );
}

function AidaMessage({ m, onChip }) {
  return (
    <div className={`aida-msg ${m.role === 'user' ? 'aida-msg-user' : 'aida-msg-ai'}`}>
      {m.role !== 'user' && (
        <span className="aida-mini-avatar" aria-hidden="true"><span className="ai-dot"></span></span>
      )}
      <div className="aida-bubble">
        <p>{m.text}</p>
        {m.kind === 'chips' && (
          <div className="aida-chips">
            {m.chips.map((c, i) => (
              <button key={i} type="button" className="aida-chip" onClick={() => onChip(c)}>{c}</button>
            ))}
          </div>
        )}
        {m.kind === 'cta' && (
          <a href={m.ctaHref} className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>{m.ctaLabel}</a>
        )}
      </div>
    </div>
  );
}

function AidaMatchView() {
  const [step, setStep] = React.useState(0);
  const questions = [
    { q: 'Where are you in your journey?',   opts: ['Matric / Grade 11–12', 'Already working', 'Changing careers', 'Studying something else'] },
    { q: 'What draws you most?',              opts: ['Mechanical & manufacturing', 'Buildings & architecture', 'Civil & structural', 'Not sure — surprise me'] },
    { q: 'Study mode that fits your life?',   opts: ['Full-time (10 months)', 'Part-time (18 months)', 'Online / self-paced', 'No preference'] },
  ];
  const done = step >= questions.length;

  if (done) {
    return (
      <div className="aida-match-result">
        <div className="aida-match-meta t-mono-xs">MATCHED · MDDOP N4/N5 · FULL-TIME · 96% FIT</div>
        <h4 className="t-h3" style={{ margin: '4px 0 8px' }}>MDDOP N4/N5 — National Certificate</h4>
        <p className="t-body-sm" style={{ marginBottom: 12 }}>
          Strongest match for your profile. Nationally examined (DHET), covers mechanical, civil and architectural draughting with AutoCAD, Revit and Inventor.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="apply.html" className="btn btn-sm btn-primary">Apply now</a>
          <button type="button" className="btn btn-sm btn-ghost-dark" onClick={() => setStep(0)}>Restart</button>
        </div>
      </div>
    );
  }

  const cur = questions[step];
  return (
    <div className="aida-match">
      <div className="aida-match-progress">
        <span className="t-mono-xs">QUESTION {step + 1} OF {questions.length}</span>
        <div className="aida-progress-track"><div className="aida-progress-bar" style={{ width: `${((step) / questions.length) * 100}%` }}></div></div>
      </div>
      <h4 className="aida-match-q">{cur.q}</h4>
      <div className="aida-match-opts">
        {cur.opts.map((o, i) => (
          <button key={i} type="button" className="aida-match-opt" onClick={() => setStep(s => s + 1)}>
            <span>{o}</span><span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AidaApplyView() {
  return (
    <div className="aida-apply">
      <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>QUICK APPLY · STEP 1 / 4</div>
      <h4 className="t-h3" style={{ margin: '6px 0 12px' }}>Let's get you started</h4>
      <div className="aida-form-row"><label className="t-mono-xs">FULL NAME</label><input type="text" placeholder="Your name" /></div>
      <div className="aida-form-row"><label className="t-mono-xs">EMAIL</label><input type="email" placeholder="you@email.com" /></div>
      <div className="aida-form-row"><label className="t-mono-xs">MOBILE</label><input type="tel" placeholder="+27 …" /></div>
      <a href="apply.html" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>Continue to full application →</a>
      <div className="t-mono-xs aida-foot" style={{ textAlign: 'center', marginTop: 8 }}>AIDA will prefill what we already know from chat.</div>
    </div>
  );
}

/* ------------------------------------------------------------
   Page shell — wires header + main + footer + AIDA
   ------------------------------------------------------------ */

function PageShell({ active, headerTone = 'dark', children }) {
  return (
    <>
      <SiteHeader active={active} tone={headerTone} />
      <main>{children}</main>
      <SiteFooter />
      <AidaWidget />
      <TweaksMount />
    </>
  );
}

function TweaksMount() {
  // mounted globally if window.AcademyTweaks is loaded
  const Comp = window.AcademyTweaks;
  if (!Comp) return null;
  return <Comp />;
}

/* ------------------------------------------------------------
   Shared section: Final CTA band (used by all pages)
   ------------------------------------------------------------ */

function FinalCTA() {
  return (
    <section className="cta-band" data-screen-label="Apply CTA">
      <div className="page cta-inner">
        <div>
          <span className="section-label" style={{ marginBottom: 18 }}><span className="bar"></span>NEXT INTAKE OPEN · GRADE 11+</span>
          <h2 className="cta-title">Stop researching. <em style={{ color: 'var(--cyan-400)', fontStyle: 'italic', fontWeight: 400 }}>Start drawing.</em></h2>
          <p className="cta-sub">
            Six minutes to apply. AIDA prefills what we already know. You'll hear back within one business day.
          </p>
          <div className="cta-actions">
            <a href="apply.html" className="btn btn-lg btn-primary">Start application <span className="arr" aria-hidden="true">→</span></a>
            <a href="about.html" className="btn btn-lg btn-ghost-dark">Visit a campus</a>
          </div>
        </div>

        <div className="cta-right">
          <div className="cta-fact">
            <span className="cta-fact-k">PROCESSING TIME</span>
            <span className="cta-fact-v">&lt; 1 business day to decision</span>
          </div>
          <div className="cta-fact">
            <span className="cta-fact-k">PAYMENT</span>
            <span className="cta-fact-v">0% interest plans · 15% upfront discount</span>
          </div>
          <div className="cta-fact">
            <span className="cta-fact-k">GUIDANCE</span>
            <span className="cta-fact-v">WhatsApp admissions · JHB + DBN</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   Export
   ------------------------------------------------------------ */
Object.assign(window, {
  SITE, NAV_ITEMS, Logo, SiteHeader, SiteFooter, AidaWidget, PageShell, WaIcon, FinalCTA,
});
