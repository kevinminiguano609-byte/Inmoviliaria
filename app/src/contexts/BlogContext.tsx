/**
 * BlogContext
 *
 * Devuelve `Article[]` (tipo legacy) para que Blog, BlogPost y AdminBlog
 * funcionen sin cambios en las páginas públicas.
 *
 * Internamente usa BlogArticleRow de Supabase y aplica el adaptador.
 * El admin recibe los datos crudos via useBlogAdmin() si los necesita.
 */

import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/services/articleService';
import { articleRowToArticle } from '@/types/adapters';
import type { Article } from '@/types/index';
import type { BlogArticleRow, BlogArticleInsert, BlogArticleUpdate } from '@/types/supabase';

interface BlogContextType {
  articles:      Article[];
  loading:       boolean;
  error:         string | null;
  // Admin usa estos con los tipos de Supabase directamente
  rawArticles:   BlogArticleRow[];
  addArticle:    (a: BlogArticleInsert) => Promise<void>;
  updateArticle: (id: string, data: BlogArticleUpdate) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  refresh:       () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [rows,    setRows]    = useState<BlogArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllArticles()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(e  => { if (!cancelled) setError((e as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  // Adaptar BlogArticleRow[] → Article[] para páginas públicas
  const articles = useMemo(() => rows.map(articleRowToArticle), [rows]);

  const addArticle = useCallback(async (a: BlogArticleInsert) => {
    const created = await createArticle(a);
    setRows(prev => [created, ...prev]);
  }, []);

  const updateArticleFn = useCallback(async (id: string, data: BlogArticleUpdate) => {
    const updated = await updateArticle(id, data);
    setRows(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteArticleFn = useCallback(async (id: string) => {
    await deleteArticle(id);
    setRows(prev => prev.filter(x => x.id !== id));
  }, []);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo(
    () => ({
      articles,
      rawArticles: rows,
      loading, error,
      addArticle,
      updateArticle: updateArticleFn,
      deleteArticle: deleteArticleFn,
      refresh,
    }),
    [articles, rows, loading, error, addArticle, updateArticleFn, deleteArticleFn, refresh],
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
