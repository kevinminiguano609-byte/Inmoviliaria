/**
 * Article Service
 *
 * Mock implementation that mirrors the Supabase client API.
 * To connect to Supabase, replace each function body with the
 * corresponding supabase.from('articles')... call.
 */

import { articles as mockArticles } from '@/data/mock';
import type { Article } from '@/types';

let store: Article[] = [...mockArticles];

export async function getArticles(): Promise<Article[]> {
  return [...store];
}

export async function getArticleById(id: string): Promise<Article | null> {
  return store.find(a => a.id === id) ?? null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return store.find(a => a.slug === slug) ?? null;
}

export async function createArticle(
  data: Omit<Article, 'id' | 'date' | 'author'>
): Promise<Article> {
  const newArticle: Article = {
    ...data,
    id: Date.now().toString(),
    author: 'Admin',
    date: new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
  store = [newArticle, ...store];
  return newArticle;
}

export async function updateArticle(
  id: string,
  data: Partial<Article>
): Promise<Article> {
  const idx = store.findIndex(a => a.id === id);
  if (idx === -1) throw new Error(`Article ${id} not found`);
  store[idx] = { ...store[idx], ...data };
  return store[idx];
}

export async function deleteArticle(id: string): Promise<void> {
  store = store.filter(a => a.id !== id);
}
