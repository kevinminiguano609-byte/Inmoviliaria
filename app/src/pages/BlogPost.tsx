import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, Clock, User, Tag } from 'lucide-react';
import PageLayout from '@/layouts/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { useBlog } from '@/contexts/BlogContext';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { articles } = useBlog();

  const article = articles.find(a => a.slug === slug);

  // Post not found → redirect to blog list
  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  // Related articles: same category, excluding current
  const related = articles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <PageLayout>
      {/* ── Header / breadcrumb ── */}
      <div className="bg-[#F5F5F5] pt-[70px]">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-10">
          <div className="flex items-center gap-2 text-sm text-[#666666] mb-4">
            <Link to="/" className="hover:text-[#E53935] transition-colors">Inicio</Link>
            <span>&gt;</span>
            <Link to="/blog" className="hover:text-[#E53935] transition-colors">Blog</Link>
            <span>&gt;</span>
            <span className="text-[#333333] font-medium truncate max-w-[200px] md:max-w-none">
              {article.title}
            </span>
          </div>

          {/* Category badge */}
          <span className="inline-block bg-[#FFF5F5] text-[#E53935] text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            {article.category}
          </span>

          <h1 className="text-3xl md:text-5xl font-normal text-[#333333] leading-tight max-w-[860px]">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-[#666666]">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[#E53935]" />
                {article.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#E53935]" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={14} className="text-[#E53935]" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero image ── */}
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 mt-8">
        <div className="aspect-video rounded-xl overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-[860px] mx-auto px-5 md:px-10 py-12">
        <ScrollReveal>
          {/* Excerpt — styled as lead paragraph */}
          {article.excerpt && (
            <p className="text-xl text-[#444444] leading-relaxed mb-8 font-light border-l-4 border-[#E53935] pl-5">
              {article.excerpt}
            </p>
          )}

          {/* Full content — supports plain text and basic HTML tags */}
          <div
            className="prose-blog text-base text-[#333333] leading-relaxed space-y-5"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
          />
        </ScrollReveal>

        {/* ── Back button ── */}
        <div className="mt-14 pt-8 border-t border-[#E0E0E0]">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-[#E53935] transition-colors"
          >
            <ChevronLeft size={16} />
            Volver al blog
          </Link>
        </div>
      </div>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <div className="bg-[#F5F5F5] py-16 md:py-20">
          <div className="max-w-[1360px] mx-auto px-5 md:px-10">
            <h2 className="text-2xl md:text-[32px] font-normal text-[#333333] mb-10">
              Artículos relacionados
            </h2>
            <ScrollReveal stagger={0.12}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map(a => (
                  <Link
                    key={a.id}
                    to={`/blog/${a.slug}`}
                    className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-shadow duration-300 group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-block bg-[#F5F5F5] text-[#666666] text-xs font-medium px-3 py-1 rounded-full mb-3">
                        {a.category}
                      </span>
                      <h3 className="text-base font-medium text-[#333333] mb-2 line-clamp-2 leading-snug">
                        {a.title}
                      </h3>
                      <p className="text-xs text-[#999999]">{a.date} &middot; {a.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

/**
 * Converts plain-text content to paragraphs when no HTML tags are present.
 * If the content already contains HTML (from the admin editor), it's returned as-is.
 */
function formatContent(content: string): string {
  // Already has HTML tags — return as-is
  if (/<[a-z][\s\S]*>/i.test(content)) return content;

  // Plain text — wrap each non-empty line in a <p>
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${line}</p>`)
    .join('');
}
