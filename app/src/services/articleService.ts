/**
 * Article Service — Supabase implementation
 */

import { supabase } from '@/lib/supabase';
import type { BlogArticleRow, BlogArticleInsert, BlogArticleUpdate } from '@/types/supabase';

function handleError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`[articleService] ${context}: ${error.message}`);
}

// ─── Queries ─────────────────────────────────────────────────

export async function getArticles(): Promise<BlogArticleRow[]> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('status', 'publicado')
    .order('published_at', { ascending: false });

  handleError(error, 'getArticles');
  return data ?? [];
}

/** Admin: get all articles regardless of status */
export async function getAllArticles(): Promise<BlogArticleRow[]> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .order('created_at', { ascending: false });

  handleError(error, 'getAllArticles');
  return data ?? [];
}

export async function getArticleById(id: string): Promise<BlogArticleRow | null> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null;
  handleError(error, 'getArticleById');
  return data;
}

export async function getArticleBySlug(slug: string): Promise<BlogArticleRow | null> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error?.code === 'PGRST116') return null;
  handleError(error, 'getArticleBySlug');
  return data;
}

export async function getArticlesByCategory(category: string): Promise<BlogArticleRow[]> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('status', 'publicado')
    .eq('category', category)
    .order('published_at', { ascending: false });

  handleError(error, 'getArticlesByCategory');
  return data ?? [];
}

// ─── Mutations ───────────────────────────────────────────────

export async function createArticle(
  payload: BlogArticleInsert
): Promise<BlogArticleRow> {
  const { data, error } = await supabase
    .from('blog_articles')
    .insert(payload)
    .select()
    .single();

  handleError(error, 'createArticle');
  return data!;
}

export async function updateArticle(
  id: string,
  payload: BlogArticleUpdate
): Promise<BlogArticleRow> {
  const { data, error } = await supabase
    .from('blog_articles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  handleError(error, 'updateArticle');
  return data!;
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_articles')
    .delete()
    .eq('id', id);

  handleError(error, 'deleteArticle');
}
