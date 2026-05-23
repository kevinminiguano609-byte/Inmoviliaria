/**
 * useArticles — hook for blog article management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getArticles,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/services/articleService';
import type { BlogArticleRow, BlogArticleInsert, BlogArticleUpdate } from '@/types/supabase';

interface UseArticlesOptions {
  adminMode?: boolean;
}

interface UseArticlesReturn {
  articles: BlogArticleRow[];
  loading:  boolean;
  error:    string | null;
  create:   (payload: BlogArticleInsert) => Promise<BlogArticleRow>;
  update:   (id: string, payload: BlogArticleUpdate) => Promise<BlogArticleRow>;
  remove:   (id: string) => Promise<void>;
  refresh:  () => void;
}

export function useArticles({ adminMode = false }: UseArticlesOptions = {}): UseArticlesReturn {
  const [articles, setArticles] = useState<BlogArticleRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = adminMode ? getAllArticles : getArticles;

    fetch()
      .then(data => { if (!cancelled) setArticles(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [adminMode, tick]);

  const create = useCallback(async (payload: BlogArticleInsert) => {
    const article = await createArticle(payload);
    setArticles(prev => [article, ...prev]);
    return article;
  }, []);

  const update = useCallback(async (id: string, payload: BlogArticleUpdate) => {
    const updated = await updateArticle(id, payload);
    setArticles(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return { articles, loading, error, create, update, remove, refresh };
}
