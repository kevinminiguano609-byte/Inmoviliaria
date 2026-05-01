import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { articles as initialArticles } from '@/data/mock';
import type { Article } from '@/types';

interface BlogContextType {
  articles: Article[];
  addArticle: (a: Article) => void;
  updateArticle: (a: Article) => void;
  deleteArticle: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  const addArticle = useCallback((a: Article) => {
    setArticles(prev => [...prev, a]);
  }, []);

  const updateArticle = useCallback((a: Article) => {
    setArticles(prev => prev.map(x => x.id === a.id ? a : x));
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => prev.filter(x => x.id !== id));
  }, []);

  const value = useMemo(() => ({ articles, addArticle, updateArticle, deleteArticle }),
    [articles, addArticle, updateArticle, deleteArticle]);

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
