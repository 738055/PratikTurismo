'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';
import { useContent } from '@/app/contexts/ContentContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { 
  Map, Clock, Star, ArrowRight, Filter, X, 
  ChevronDown, ChevronRight, Search, SlidersHorizontal, MapPin, Check
} from 'lucide-react';
import { Product } from '@/app/types';

function ToursSearchContent() {
  const { products, categories, loading } = useContent();
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Estados de Filtro ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortOption, setSortOption] = useState('relevance'); // relevance, price_asc, price_desc, name_asc
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const dynamicMaxPrice = useMemo(() => {
    if (!products.length) return 5000;
    // Pega o maior preço dentre todos os tipos de experiências
    return Math.max(...products.filter(p => ['tour', 'ticket', 'package'].includes(p.type)).map(p => p.price));
  }, [products]);

  // NOVO: Atualiza a faixa de preço assim que os produtos carregam
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange(prev => ({ ...prev, max: dynamicMaxPrice }));
    }
  }, [dynamicMaxPrice, products.length]);

  // Inicializa filtros via URL se existirem
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q) setSearchTerm(q);
    if (cat) {
        // Tenta encontrar o ID da categoria pelo slug ou nome
        const categoryFound = categories.find(c => c.slug === cat || c.id === cat);
        if (categoryFound) {
            setSelectedCategories([categoryFound.id]);
        }
    }
  }, [searchParams, categories]);

  // --- Lógica de Filtragem e Ordenação ---
  const filteredTours = useMemo(() => {
    // 1. INTEGRAÇÃO: Agora aceita Tours, Ingressos e Pacotes na mesma vitrine!
    let result = products.filter(p => 
      ['tour', 'ticket', 'package'].includes(p.type) && p.active
    );

    // 2. Busca por Texto (Aprimorada)
    if (searchTerm) {
      const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const lowerTerm = normalizeText(searchTerm);
      result = result.filter(p => 
        normalizeText(p.name).includes(lowerTerm) || 
        normalizeText(p.description || '').includes(lowerTerm) ||
        // Procura também dentro das tags e categorias
        (p.category && normalizeText(p.category).includes(lowerTerm))
      );
    }

    // 3. Filtro por Categoria (Cruza ID oficial e o Slug visual de forma flexível)
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const matchById = p.categoryId && selectedCategories.includes(p.categoryId as string);
        const matchBySlug = p.category && selectedCategories.some(catId => {
           const catObj = categories.find(c => c.id === catId);
           return catObj && catObj.slug === p.category;
        });
        return matchById || matchBySlug;
      });
    }

    // 4. Filtro por Preço
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // 4. Ordenação
    switch (sortOption) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Relevância: Destaques primeiro
        result.sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));
    }

    return result;
  }, [products, searchTerm, selectedCategories, priceRange, sortOption]);

  // Handlers
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 5000 });
    setSortOption('relevance');
    router.push('/tours/search'); // Limpa URL
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Componente de Filtros (Reutilizável para Mobile/Desktop)
  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Busca */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Buscar</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Nome do passeio..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Categorias */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Categorias</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id) ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                {selectedCategories.includes(cat.id) && <Search size={12} className="text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              <span className={`text-sm ${selectedCategories.includes(cat.id) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Faixa de Preço</h3>
        <div className="px-1">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
            <span>R$ {priceRange.min}</span>
            <span>R$ {priceRange.max}+</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="2000" 
            step="50"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-gray-400 mt-2">Até R$ {priceRange.max},00 por pessoa</p>
        </div>
      </div>

      {/* Botão Limpar */}
      <button 
        onClick={clearFilters}
        className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-lg hover:border-red-200"
      >
        Limpar Filtros
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Header da Página Redesigned */}
      <div className="bg-secondary relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-secondary/80 to-secondary" />
        
        <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <nav className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-white">Explorar</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                Passeios e <span className="text-primary italic">Experiências</span>
              </h1>
              <p className="text-white/60 text-lg font-medium mt-2">Encontre a aventura perfeita em Foz do Iguaçu</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white/10">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Resultados</span>
              <div className="text-3xl font-black text-white tracking-tighter">
                {filteredTours.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Desktop Redesigned */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-100 sticky top-28">
              <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
                <Filter size={20} className="text-primary" />
                <h2 className="font-black text-secondary text-lg uppercase tracking-tight">Filtros</h2>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1">
            
            {/* Toolbar Redesigned */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-soft">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-3 bg-secondary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-secondary/20"
              >
                <SlidersHorizontal size={20} /> FILTRAR
              </button>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Ordenar:</span>
                <div className="relative flex-1 sm:flex-initial">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full sm:w-48 appearance-none bg-gray-50 border border-gray-100 text-secondary py-3.5 pl-5 pr-10 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 cursor-pointer transition-all hover:bg-white"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="name_asc">Nome (A-Z)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Resultados Grid/List */}
            {filteredTours.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-soft">
                <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-secondary mb-2 tracking-tight">Ops! Nada encontrado</h3>
                <p className="text-gray-500 font-medium mb-8">Não encontramos passeios com esses critérios.</p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                >
                  LIMPAR TUDO
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredTours.map((tour) => (
                  <ProductCard 
                    key={tour.id} 
                    product={tour} 
                    layout="horizontal" 
                  />
                ))}
              </div>
            )}

            {/* Paginação Redesigned */}
            {filteredTours.length > 0 && (
               <div className="mt-16 flex justify-center">
                  <div className="flex gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-soft">
                     <button className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled>
                       <ChevronLeft size={20} />
                     </button>
                     <button className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20">1</button>
                     <button className="w-12 h-12 flex items-center justify-center text-secondary font-bold hover:bg-gray-50 rounded-xl">2</button>
                     <button className="w-12 h-12 flex items-center justify-center rounded-xl text-secondary hover:bg-gray-50">
                       <ChevronRight size={20} />
                     </button>
                  </div>
               </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Filter size={20} /> Filtros
              </h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <FilterPanel />
            </div>
            <div className="p-4 border-t border-gray-100">
               <button 
                 onClick={() => setIsMobileFilterOpen(false)}
                 className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg"
               >
                 Ver {filteredTours.length} resultados
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// OBRIGATÓRIO: Suspense wrapper
export default function ToursSearchPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      }>
        <ToursSearchContent />
      </Suspense>
    </PublicLayout>
  );
}