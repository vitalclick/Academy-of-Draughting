// Per-platform install steps for the generated signature. Kept inline so it
// stays close to the builder UI and reads as "next step" guidance.

const summaryStyle: React.CSSProperties = {
  cursor: 'pointer',
  padding: '10px 14px',
  fontWeight: 600,
  color: 'var(--navy-900)',
  fontSize: 14,
  background: 'var(--paper-2)',
  borderBottom: '1px solid var(--line-on-light)',
  listStyle: 'none',
};

const bodyStyle: React.CSSProperties = {
  padding: '14px 18px',
  fontSize: 13,
  lineHeight: 1.6,
  color: 'var(--ink-2)',
};

export function InstallInstructions() {
  return (
    <div className="sig-card" style={{ overflow: 'hidden' }}>
      <div className="sig-card-head">How to install your signature</div>
      <div style={{ padding: '14px 18px', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-3)' }}>
        Generate above, then use <strong>Copy rich</strong> for visual editors (Gmail, Outlook
        web, cPanel webmail) or <strong>Copy HTML</strong> for clients that accept raw HTML.
      </div>

      <details>
        <summary style={summaryStyle}>cPanel Webmail (Roundcube)</summary>
        <div style={bodyStyle}>
          <div
            style={{
              background: 'var(--blue-100)',
              border: '1px solid var(--blue-300)',
              borderRadius: 4,
              padding: '10px 12px',
              marginBottom: 12,
            }}
          >
            <strong style={{ color: 'var(--navy-900)' }}>One-time setup — do this first</strong>
            <p style={{ margin: '6px 0 0' }}>
              On reseller cPanel, the default for new accounts is{' '}
              <strong>Compose HTML messages → Never</strong>, which strips formatting and breaks
              the signature. Each mailbox owner has to switch it themselves — the host can&apos;t
              change it globally.
            </p>
            <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>
                In Roundcube, click <strong>Settings</strong> (cog icon) →{' '}
                <strong>Preferences</strong> → <strong>Composing Messages</strong>.
              </li>
              <li>
                Set <strong>Compose HTML messages</strong> to <strong>Always</strong>.
              </li>
              <li>Click <strong>Save</strong>. You only need to do this once per mailbox.</li>
            </ol>
          </div>

          <strong style={{ color: 'var(--navy-900)' }}>Then install the signature</strong>
          <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            <li>
              Log in at <code>https://mail.academydraughting.com</code> (or{' '}
              <code>yourdomain:2096</code>) and open <strong>Roundcube</strong>.
            </li>
            <li>
              Click <strong>Settings</strong> (cog icon, bottom-left) →{' '}
              <strong>Identities</strong>.
            </li>
            <li>Select your identity from the list.</li>
            <li>
              Tick <strong>HTML signature</strong>. The signature box becomes a rich-text editor.
            </li>
            <li>
              Click the source-code icon <code>&lt;/&gt;</code> in the toolbar and paste the{' '}
              <strong>HTML source</strong> from above. Click the icon again to exit source view.
            </li>
            <li>Click <strong>Save</strong>.</li>
          </ol>
          <p style={{ marginTop: 10, color: 'var(--ink-3)' }}>
            For <strong>Horde</strong>: Mail → Preferences → Personal Information → Signature →
            set <em>Signature type</em> to <strong>HTML</strong> → paste HTML source → Save.
          </p>
        </div>
      </details>

      <details>
        <summary style={summaryStyle}>Outlook</summary>
        <div style={bodyStyle}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Outlook desktop (Windows / Mac)</p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Click <strong>Copy rich</strong> above.</li>
            <li>
              In Outlook: <strong>File → Options → Mail → Signatures…</strong> (Mac:{' '}
              <strong>Outlook → Preferences → Signatures</strong>).
            </li>
            <li>
              Click <strong>New</strong>, name the signature, click into the body, then paste
              (<kbd>Ctrl</kbd>+<kbd>V</kbd> / <kbd>⌘</kbd>+<kbd>V</kbd>).
            </li>
            <li>
              Under <em>Choose default signature</em>, set it for <strong>New messages</strong>{' '}
              and <strong>Replies/forwards</strong>.
            </li>
            <li>Click <strong>OK</strong> / <strong>Save</strong>.</li>
          </ol>
          <p style={{ margin: '12px 0 8px', fontWeight: 600 }}>
            Outlook on the web / Microsoft 365
          </p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Click <strong>Copy rich</strong> above.</li>
            <li>
              Open <strong>Settings</strong> (gear, top-right) →{' '}
              <strong>Mail → Compose and reply</strong>.
            </li>
            <li>Paste into <strong>Email signature</strong>.</li>
            <li>
              Tick <em>Automatically include my signature on new messages</em> and{' '}
              <em>on replies/forwards</em>.
            </li>
            <li>Click <strong>Save</strong>.</li>
          </ol>
        </div>
      </details>

      <details>
        <summary style={summaryStyle}>Gmail</summary>
        <div style={bodyStyle}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Click <strong>Copy rich</strong> above.</li>
            <li>
              In Gmail (web): click the gear (top-right) → <strong>See all settings</strong>.
            </li>
            <li>
              Scroll down to the <strong>Signature</strong> section and click{' '}
              <strong>Create new</strong>. Give it a name.
            </li>
            <li>
              Click into the signature editor and paste (<kbd>Ctrl</kbd>+<kbd>V</kbd> /{' '}
              <kbd>⌘</kbd>+<kbd>V</kbd>). Images and brand colours should appear straight away.
            </li>
            <li>
              Under <em>Signature defaults</em>, set it for <strong>New emails</strong> and{' '}
              <strong>On reply/forward</strong>.
            </li>
            <li>
              Scroll to the bottom and click <strong>Save Changes</strong>.
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary style={summaryStyle}>Android phone</summary>
        <div style={bodyStyle}>
          <p style={{ margin: 0 }}>
            The native mail apps on Android only support plain-text signatures — paste the HTML
            and you&apos;ll see raw tags. Two ways around it:
          </p>
          <p style={{ margin: '10px 0 6px', fontWeight: 600 }}>
            Option 1 · Set it on the desktop, use it on the phone
          </p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>On a desktop browser, sign in to your Gmail / Outlook web account.</li>
            <li>
              Set the rich signature there (see Gmail / Outlook sections above).
            </li>
            <li>
              On the phone, the Gmail / Outlook app will use that signature automatically when
              sending and replying.
            </li>
          </ol>
          <p style={{ margin: '12px 0 6px', fontWeight: 600 }}>
            Option 2 · Plain-text fallback in the app
          </p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              Open the <strong>Gmail</strong> or <strong>Outlook</strong> app → tap your account
              avatar → <strong>Settings</strong>.
            </li>
            <li>
              Tap your account → <strong>Mobile signature</strong> (Gmail) or{' '}
              <strong>Signature</strong> (Outlook).
            </li>
            <li>
              Type a short plain-text version, e.g.{' '}
              <em>
                &ldquo;Jane Mokoena · Head of Admissions · Academy of Advanced Draughting · +27
                68 110 0746&rdquo;
              </em>
              .
            </li>
          </ol>
        </div>
      </details>

      <details>
        <summary style={summaryStyle}>iPhone / iPad (iOS)</summary>
        <div style={bodyStyle}>
          <p style={{ margin: '0 0 6px', fontWeight: 600 }}>Apple Mail (the built-in app)</p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>On the phone, open the signatures page in Safari and click <strong>Copy rich</strong>.</li>
            <li>Open <strong>Settings → Mail → Signature</strong>.</li>
            <li>Long-press the text field and tap <strong>Paste</strong>.</li>
            <li>
              iOS often strips formatting on first paste. If it does: shake the phone and tap{' '}
              <strong>Undo</strong> — this reverts the strip and keeps the rich version. (Yes,
              really.)
            </li>
            <li>Pick the account(s) to apply the signature to.</li>
          </ol>
          <p style={{ margin: '12px 0 6px', fontWeight: 600 }}>Gmail app on iOS</p>
          <p style={{ margin: 0 }}>
            Same as Android — set the rich signature in Gmail web on a desktop, the iOS app will
            use it automatically. The in-app signature setting is plain text only.
          </p>
          <p style={{ margin: '12px 0 6px', fontWeight: 600 }}>Outlook app on iOS</p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Set the rich signature in Outlook on the web first (see Outlook section).</li>
            <li>
              In the iOS Outlook app: tap your avatar → <strong>Settings</strong> →{' '}
              <strong>Signature</strong> → toggle <strong>Per Account Signature</strong> off (so
              it inherits the web one).
            </li>
          </ol>
        </div>
      </details>
    </div>
  );
}
