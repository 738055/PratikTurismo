'use client';

import React, { Suspense } from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';
import { useContent } from '@/app/contexts/ContentContext';
import Link from 'next/link';
import { 
  ArrowRight, Tag, Map, Camera, Coffee, 
  Compass, Anchor, Bike, Ticket, MapPin 
} from 'lucide-react';
import * as Icons from 'lucide-react';

function CategoriesContent() {
  const { categories, products, loading } = useContent();

  // Função auxiliar para contar produtos por categoria
  const getProductCount = (catId: string) => {
    return products.filter(p => p.category === catId && p.active).length;
  };

  // Renderiza ícone dinâmico
  const renderIcon = (iconName: string, size = 24) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Tag;
    return <IconComponent size={size} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A3AD]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Hero */}
      <div className="bg-[#1D1D1D] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-opacity.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Explore por Categorias</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Encontre a experiência perfeita para o seu estilo de viagem. 
            De aventuras radicais a passeios gastronômicos.
          </p>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(c => c.active).map((category) => {
            const count = getProductCount(category.id);
            
            return (
              <Link 
                key={category.id} 
                href={`/tours/search?category=${category.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Cabeçalho do Card com Ícone */}
                <div className="p-8 flex items-start justify-between bg-gradient-to-br from-gray-50 to-white">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    {renderIcon(category.icon, 32)}
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    {count} experiências
                  </span>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-8 pt-2 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.label}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                    {category.description || `Descubra as melhores opções de ${category.label.toLowerCase()} em Foz do Iguaçu.`}
                  </p>
                  
                  <div className="mt-auto flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Explorar <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Seção Informativa Inferior */}
      <div className="container mx-auto px-4 mt-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Não sabe por onde começar?</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Fale com nossos especialistas locais. Podemos montar um roteiro personalizado baseado nos seus interesses.
              </p>
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3 bg-[#00A3AD] text-white font-bold rounded-xl hover:bg-[#008A93] transition-colors shadow-lg shadow-teal-500/20">
                 Falar com Consultor
              </Link>
           </div>
           <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 rounded-2xl text-center">
                 <MapPin className="mx-auto text-[#00A3AD] mb-3" size={32} />
                 <h4 className="font-bold">Localização</h4>
                 <p className="text-sm text-gray-500">Especialistas em Foz</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl text-center">
                 <Ticket className="mx-auto text-[#00A3AD] mb-3" size={32} />
                 <h4 className="font-bold">Melhores Preços</h4>
                 <p className="text-sm text-gray-500">Sem taxas ocultas</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <PublicLayout>
      <Suspense fallback={null}>
        <CategoriesContent />
      </Suspense>
    </PublicLayout>
  );
}