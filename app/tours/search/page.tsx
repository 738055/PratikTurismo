'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';
import { useContent } from '@/app/contexts/ContentContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { 
  Map, Clock, Star, ArrowRight, Filter, X, 
  ChevronDown, Search, SlidersHorizontal, MapPin, Check
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
    <div className="bg-gray-50 min-h-screen">
      {/* Header da Página */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Passeios e Experiências</h1>
              <p className="text-gray-500 text-sm mt-1">Explore o melhor de Foz do Iguaçu</p>
            </div>
            <div className="text-sm text-gray-500">
              <strong>{filteredTours.length}</strong> resultados encontrados
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1">
            
            {/* Barra de Ferramentas (Mobile Filter + Sort) */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm"
              >
                <SlidersHorizontal size={18} /> Filtros
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500 hidden sm:inline">Ordenar por:</span>
                <div className="relative">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="name_asc">Nome (A-Z)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lista de Resultados */}
            {filteredTours.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum passeio encontrado</h3>
                <p className="text-gray-500 text-sm mb-6">Tente ajustar seus filtros ou buscar por outro termo.</p>
                <button 
                  onClick={clearFilters}
                  className="text-primary font-medium hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTours.map((tour) => (
                  <ProductCard 
                    key={tour.id} 
                    product={tour} 
                    layout="horizontal" 
                  />
                ))}
              </div>
            )}

            {/* Paginação (Visual) */}
            {filteredTours.length > 0 && (
               <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                     <button className="px-4 py-2 border rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
                     <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold">1</button>
                     <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">2</button>
                     <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Próximo</button>
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