import { notFound } from 'next/navigation';
import { getContent } from '@/lib/db/admin';
import { ContentEditor } from '../editor';

export const dynamic = 'force-dynamic';

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getContent(id);
  if (!item) notFound();

  return (
    <div>
      <div className="admin-header">
        <h1 className="t-h2">{item.title}</h1>
        <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 4 }}>
          {item.kind.toUpperCase()} · {item.state.toUpperCase()}
          {item.slug ? ` · /${item.slug}` : ''}
          {item.ai_model ? ` · ${item.ai_model}` : ''}
        </div>
      </div>
      <ContentEditor initial={item} />
    </div>
  );
}
