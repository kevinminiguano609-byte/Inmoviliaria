import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import PageLayout from '@/layouts/PageLayout';
import PropertyCard from '@/components/PropertyCard';
import { useProperty } from '@/contexts/PropertyContext';

export default function Properties() {
  const { properties } = useProperty();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    operation: searchParams.get('operation') || '',
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    priceMin: '',
    priceMax: '',
  });
  const [sortBy, setSortBy] = useState('recientes');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  const filtered = useMemo(() => {
    let result = [...properties];

    if (filters.operation) {
      result = result.filter(p => p.operation === filters.operation);
    }
    if (filters.type) {
      result = result.filter(p => p.type === filters.type);
    }
    if (filters.location) {
      result = result.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.priceMin) {
      result = result.filter(p => p.price >= Number(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter(p => p.price <= Number(filters.priceMax));
    }

    if (sortBy === 'precio-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'precio-desc') result.sort((a, b) => b.price - a.price);

    return result;
  }, [properties, filters, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasFilters = Object.values(filters).some(v => v !== '');

  const clearFilters = () => {
    setFilters({ operation: '', type: '', location: '', priceMin: '', priceMax: '' });
    setCurrentPage(1);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-[#F5F5F5] pt-[70px]">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-12">
          <div className="flex items-center gap-2 text-sm text-[#666666] mb-4">
            <Link to="/" className="hover:text-[#E53935] transition-colors">Inicio</Link>
            <span>&gt;</span>
            <span className="text-[#333333] font-medium">Propiedades</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-normal text-[#333333]">Propiedades</h1>
          <p className="text-lg text-[#666666] mt-2">
            Explora nuestra selecci&oacute;n de propiedades en las mejores zonas de Buenos Aires.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 -mt-4 relative z-10">
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 md:p-5 flex flex-wrap items-center gap-3">
          <select
            className="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm text-[#333333] outline-none focus:border-[#E53935]"
            value={filters.operation}
            onChange={e => { setFilters({ ...filters, operation: e.target.value }); setCurrentPage(1); }}
          >
            <option value="">Todas las operaciones</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>

          <select
            className="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm text-[#333333] outline-none focus:border-[#E53935]"
            value={filters.type}
            onChange={e => { setFilters({ ...filters, type: e.target.value }); setCurrentPage(1); }}
          >
            <option value="">Todos los tipos</option>
            <option value="departamento">Departamento</option>
            <option value="casa">Casa</option>
            <option value="oficina">Oficina</option>
            <option value="terreno">Terreno</option>
            <option value="local">Local</option>
          </select>

          <input
            type="text"
            placeholder="Buscar ubicaci&oacute;n..."
            className="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#E53935] placeholder:text-[#999] flex-1 min-w-[150px]"
            value={filters.location}
            onChange={e => { setFilters({ ...filters, location: e.target.value }); setCurrentPage(1); }}
          />

          <input
            type="number"
            placeholder="Precio min"
            className="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#E53935] placeholder:text-[#999] w-[120px]"
            value={filters.priceMin}
            onChange={e => { setFilters({ ...filters, priceMin: e.target.value }); setCurrentPage(1); }}
          />

          <input
            type="number"
            placeholder="Precio max"
            className="border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#E53935] placeholder:text-[#999] w-[120px]"
            value={filters.priceMax}
            onChange={e => { setFilters({ ...filters, priceMax: e.target.value }); setCurrentPage(1); }}
          />

          <button className="bg-[#E53935] hover:bg-[#C62828] text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shrink-0">
            <Search size={16} /> Buscar
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-[#666666] hover:text-[#E53935] text-sm font-medium flex items-center gap-1 transition-colors shrink-0"
            >
              <X size={16} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-base text-[#666666]">
            <span className="font-medium text-[#333333]">{filtered.length}</span> propiedades encontradas
          </p>
          <select
            className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#333333] outline-none focus:border-[#E53935]"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="recientes">M&aacute;s recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[#F5F5F5]">
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-8 pb-20">
          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginated.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-[#666666]">No se encontraron propiedades con los filtros seleccionados.</p>
              <button onClick={clearFilters} className="mt-4 text-[#E53935] font-medium hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#333333] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    p === currentPage ? 'bg-[#E53935] text-white' : 'text-[#333333] hover:bg-[#F5F5F5]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#333333] hover:bg-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
