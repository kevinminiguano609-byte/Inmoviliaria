import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageLayout from '@/layouts/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { useBlog } from '@/contexts/BlogContext';

const categories = ['Todas', 'Tendencias', 'Consejos', 'Inversión', 'Legal', 'Decoración'];

export default function Blog() {
  const { articles } = useBlog();
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (activeCategory === 'Todas') return articles;
    return articles.filter(a => a.category === activeCategory);
  }, [articles, activeCategory]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageLayout>
      <div className="bg-[#F5F5F5] pt-[70px]">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-12">
          <div className="flex items-center gap-2 text-sm text-[#666666] mb-4">
            <Link to="/" className="hover:text-[#E53935] transition-colors">Inicio</Link>
            <span>&gt;</span>
            <span className="text-[#333333] font-medium">Blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-normal text-[#333333]">Blog Inmobiliario</h1>
          <p className="text-lg text-[#666666] mt-2">
            Consejos, tendencias y noticias del mercado inmobiliario.
          </p>
        </div>
      </div>

      {/* Featured Article */}
      {articles[0] && (
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-12">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="aspect-video rounded-xl overflow-hidden">
                <img src={articles[0].image} alt={articles[0].title} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="inline-block bg-[#FFF5F5] text-[#E53935] text-xs font-medium px-3 py-1.5 rounded-full mb-3">
                  {articles[0].category}
                </span>
                <h2 className="text-xl md:text-[28px] font-medium text-[#333333] leading-tight mb-4">
                  {articles[0].title}
                </h2>
                <p className="text-base text-[#666666] leading-relaxed mb-4">
                  {articles[0].excerpt}
                </p>
                <p className="text-sm text-[#999999] mb-4">
                  {articles[0].date} &middot; {articles[0].readTime}
                </p>
                <span className="text-[#E53935] font-medium text-base hover:underline cursor-pointer">
                  Leer art&iacute;culo &rarr;
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      )}

      {/* Category Filters */}
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 pb-6">
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#E53935] text-white'
                  : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#FFF5F5] hover:text-[#E53935]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 pb-20">
        <ScrollReveal stagger={0.12}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginated.map(article => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-shadow duration-300 group">
                <div className="aspect-video overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className="inline-block bg-[#F5F5F5] text-[#666666] text-xs font-medium px-3 py-1 rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-medium text-[#333333] mb-2 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#666666] mb-3 line-clamp-2">{article.excerpt}</p>
                  <p className="text-xs text-[#999999]">{article.date} &middot; {article.readTime}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#333333] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${p === currentPage ? 'bg-[#E53935] text-white' : 'text-[#333333] hover:bg-[#F5F5F5]'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#333333] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
