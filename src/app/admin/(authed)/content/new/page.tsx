import { ContentEditor } from '../editor';

export default function NewContentPage() {
  return (
    <div>
      <div className="admin-header">
        <h1 className="t-h2">New content</h1>
        <p className="t-body" style={{ color: 'var(--ink-3)', marginTop: 8 }}>
          Pick a kind, give Claude a prompt, and edit the draft before publishing. Or skip the
          prompt and type the body manually.
        </p>
      </div>
      <ContentEditor />
    </div>
  );
}
