import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { ContentBlockRow } from '@/types/database';

export async function listPublishedBlogPosts(): Promise<ContentBlockRow[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from('content_blocks')
    .select('*')
    .eq('kind', 'blog_post')
    .eq('state', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(50);
  if (error) {
    console.warn('[content] listPublished failed', error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<ContentBlockRow | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from('content_blocks')
    .select('*')
    .eq('kind', 'blog_post')
    .eq('state', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.warn('[content] getBySlug failed', error.message);
    return null;
  }
  return data;
}

export async function listPublishedFaqs(): Promise<ContentBlockRow[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from('content_blocks')
    .select('*')
    .eq('kind', 'faq')
    .eq('state', 'published')
    .order('updated_at', { ascending: false })
    .limit(20);
  return data ?? [];
}
