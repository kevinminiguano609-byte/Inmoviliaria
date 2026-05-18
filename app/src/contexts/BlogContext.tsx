/**
 * BlogContext — conectado a Supabase
 */

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/services/articleService';
import type { BlogArticleRow, BlogArticleInsert, BlogArticleUpdate } from '@/types/supabase';

interface BlogContextType {
  articles:      BlogArticleRow[];
  loading:       boolean;
  error:         string | null;
  addArticle:    (a: BlogArticleInsert) => Promise<void>;
  updateArticle: (id: string, data: BlogArticleUpdate) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  refresh:       () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<BlogArticleRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getArticles()
      .then(data => { if (!cancelled) setArticles(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const addArticle = useCallback(async (a: BlogArticleInsert) => {
    const created = await createArticle(a);
    setArticles(prev => [created, ...prev]);
  }, []);

  const updateArticleFn = useCallback(async (id: string, data: BlogArticleUpdate) => {
    const updated = await updateArticle(id, data);
    setArticles(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteArticleFn = useCallback(async (id: string) => {
    await deleteArticle(id);
    setArticles(prev => prev.filter(x => x.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      articles, loading, error,
      addArticle,
      updateArticle: updateArticleFn,
      deleteArticle: deleteArticleFn,
      refresh,
    }),
    [articles, loading, error, addArticle, updateArticleFn, deleteArticleFn, refresh],
  );

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error('useBlog must be used within BlogProvider');
  return ctx;
}
