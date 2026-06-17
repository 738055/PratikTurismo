'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';
import { useContent } from '@/app/contexts/ContentContext';
import Link from 'next/link';
import { 
  Ticket, Star, ArrowRight, Filter, X, 
  ChevronDown, Search, SlidersHorizontal, CheckCircle 
} from 'lucide-react';

function TicketsSearchContent() {
  const { products, loading } = useContent();

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [sortOption, setSortOption] = useState('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Lógica de Filtragem (Foca apenas em 'ticket')
  const filteredTickets = useMemo(() => {
    let result = products.filter(p => {
      if (!p.active) return false;
      
      const isTicketType = p.type === 'ticket';
      // Permite que qualquer slug de categoria contendo "ingresso" seja aprovado
      const isTicketCategory = p.category && p.category.toLowerCase().includes('ingresso');

      return isTicketType || isTicketCategory;
    });

    // 2. Busca por Texto (continua igual o seu original)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        (p.description && p.description.toLowerCase().includes(lowerTerm))
      );
    }
    
    // 3. Filtro por Preço
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // 4. Ordenação
    switch (sortOption) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));
    }

    return result;
  }, [products, searchTerm, priceRange, sortOption]);

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange({ min: 0, max: 2000 });
    setSortOption('relevance');
  };

  // Componente de Filtros Lateral
  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Buscar Ingresso</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ex: Cataratas, Parque das Aves..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5E9E20] outline-none text-sm"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Preço Máximo</h3>
        <div className="px-1">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
            <span>R$ 0</span>
            <span>R$ {priceRange.max}</span>
          </div>
          <input 
            type="range" min="0" max="2000" step="10"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5E9E20]"
          />
        </div>
      </div>

      <button 
        onClick={clearFilters}
        className="w-full py-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
      >
        Limpar Filtros
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Específico de Ingressos */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-accent/10 text-accent rounded-lg">
                <Ticket size={24} />
             </div>
             <h1 className="text-3xl font-bold text-gray-900">Ingressos</h1>
          </div>
          <p className="text-gray-500 text-sm">Garanta sua entrada para as principais atrações de Foz sem filas.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Main List */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm"
              >
                <SlidersHorizontal size={18} /> Filtros
              </button>
              
              <div className="ml-auto flex items-center gap-2">
                 <span className="text-sm text-gray-500 hidden sm:inline">Ordenar:</span>
                 <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm font-bold focus:outline-none"
                 >
                    <option value="relevance">Relevância</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                 </select>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold">Nenhum ingresso encontrado</h3>
                <button onClick={clearFilters} className="text-[#5E9E20] font-bold mt-2">Limpar filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                       <img src={ticket.imageUrl || '/placeholder.jpg'} alt={ticket.name} className="w-full h-full object-cover" />
                       <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          Ingresso Digital
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                       <h3 className="font-bold text-lg text-gray-900 mb-2">{ticket.name}</h3>
                       <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <CheckCircle size={14} className="text-green-500" />
                          <span>Entrega Imediata no E-mail</span>
                       </div>
                       <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ticket.description}</p>
                       
                       <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                          <div>
                             <span className="text-[10px] text-gray-400 uppercase font-bold">Valor Adulto</span>
                             <div className="text-xl font-black text-[#5E9E20]">{ticket.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                          </div>
                          <Link href={`/tours/${ticket.slug}`} className="bg-[#5E9E20] text-white p-2.5 rounded-lg hover:bg-[#4A7C1A] transition-colors">
                             <ArrowRight size={20} />
                          </Link>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Drawer Mobile */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">Filtros</h2>
                <button onClick={() => setIsMobileFilterOpen(false)}><X size={24} /></button>
             </div>
             <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketsSearchPage() {
  return (
    <PublicLayout>
       <Suspense fallback={null}>
         <TicketsSearchContent />
       </Suspense>
    </PublicLayout>
  );
}