import {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, type ReactNode,
} from 'react';
import * as articleService from '@/services/articleService';
import type { Article } from '@/types';

interface BlogContextType {
  articles: Article[];
  loading: boolean;
  addArticle: (a: Omit<Article, 'id' | 'date' | 'author'>) => Promise<void>;
  updateArticle: (id: string, data: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService.getArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const addArticle = useCallback(async (a: Omit<Article, 'id' | 'date' | 'author'>) => {
    const created = await articleService.createArticle(a);
    setArticles(prev => [created, ...prev]);
  }, []);

  const updateArticle = useCallback(async (id: string, data: Partial<Article>) => {
    const updated = await articleService.updateArticle(id, data);
    setArticles(prev => prev.map(x => x.id === id ? updated : x));
  }, []);

  const deleteArticle = useCallback(async (id: string) => {
    await articleService.deleteArticle(id);
    setArticles(prev => prev.filter(x => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({ articles, loading, addArticle, updateArticle, deleteArticle }),
    [articles, loading, addArticle, updateArticle, deleteArticle],
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
