'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ArrowRight, ShieldCheck, Headphones, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/Layout/PublicLayout';
import { useContent } from '@/app/contexts/ContentContext';
import PromoModal from '@/components/PromoModal';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  // Removido useLanguage se não estiver sendo usado explicitamente para texto fixo agora
  // const { t } = useLanguage(); 
  const { banners, getFeaturedProducts, categories } = useContent(); 
  const featuredProducts = getFeaturedProducts();
  const router = useRouter();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Filtra banners ativos (redundante se o contexto já filtra, mas seguro)
  const activeBanners = banners.filter(b => b.active);

  useEffect(() => {
    if (activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [activeBanners.length]);

  return (
    <PublicLayout>
      {/* --- HERO SECTION --- */}
      <section className="relative h-[500px] md:h-[600px] w-full bg-slate-900 overflow-hidden group">
        {activeBanners.length > 0 ? activeBanners.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[10s] hover:scale-105"
              style={{ backgroundImage: `url("${slide.imageUrl}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
            </div>
            
            <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
               <div className={`max-w-4xl ${slide.align === 'center' ? 'mx-auto text-center' : slide.align === 'right' ? 'ml-auto text-right' : ''} text-white animate-fadeIn`}>
                 <div className="mb-4 overflow-hidden">
                    <span className="inline-block px-4 py-1.5 bg-urgent/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/20 animate-slide-in-bottom">
                        Foz do Iguaçu • Paraguai • Argentina
                    </span>
                 </div>
                 <h2 className="text-4xl md:text-7xl font-black mb-6 leading-tight drop-shadow-2xl tracking-tight">
                    {slide.title}
                 </h2>
                 <p className="text-lg md:text-2xl font-medium mb-10 opacity-90 max-w-2xl inline-block leading-relaxed drop-shadow-md">
                    {slide.subtitle}
                 </p>
                 <div className={slide.align === 'center' ? 'flex justify-center' : slide.align === 'right' ? 'flex justify-end' : ''}>
                    <button 
                      onClick={() => slide.link && router.push(slide.link)}
                      className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-full transition-all transform hover:-translate-y-1 hover:shadow-primary/50 shadow-2xl flex items-center gap-3 group/btn border border-white/10"
                    >
                      {slide.buttonText || 'Saiba Mais'} <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform"/>
                    </button>
                 </div>
               </div>
            </div>
          </div>
        )) : (
           <div className="absolute inset-0 flex items-center justify-center text-white bg-slate-800">
              <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Bem-vindo à Reserva Turismo</h2>
                  <p className="text-white/60">Configure seus banners no Painel Administrativo.</p>
              </div>
           </div>
        )}
        
        {/* Navigation Dots */}
        {activeBanners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {activeBanners.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-urgent' : 'w-2 bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        )}
      </section>

      {/* --- MODAL PROMOCIONAL --- */}
      <PromoModal />

      {/* --- QUICK CATEGORIES --- */}
      <section className="relative z-30 -mt-10 mb-12">
        <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-wrap justify-center md:justify-between items-center gap-6">
                {categories.length > 0 ? categories.slice(0, 5).map((cat) => (
                    <div 
                        key={cat.id} 
                        onClick={() => router.push(cat.slug === 'transfers' ? '/transfers/search' : `/tours/search?category=${cat.slug}`)}
                        className="flex flex-col items-center gap-3 cursor-pointer group w-24 md:w-auto"
                    >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30">
                            <Star size={28} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary uppercase tracking-wide text-center">{cat.label}</span>
                    </div>
                )) : (
                    <p className="text-gray-400 text-sm">Carregando categorias...</p>
                )}
            </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS --- */}
      <section className="py-8 md:py-16 overflow-hidden bg-gray-50/50">
        <div className="container mx-auto px-4 relative">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
             <div>
                 <span className="text-urgent font-bold text-sm uppercase tracking-wider mb-2 block">Experiências Incríveis</span>
                 <h2 className="text-3xl md:text-4xl font-black text-secondary">O que fazer em Foz?</h2>
                 <p className="text-gray-500 mt-2">Conheça as principais atrações da região</p>
             </div>
             <Link href="/tours/search" className="bg-urgent hover:bg-urgent-dark text-white font-bold py-2 px-6 rounded-full transition-colors flex items-center gap-2 shadow-md shrink-0">
                Ver todas as opções <ArrowRight size={18} />
             </Link>
          </div>

          {/* Carrossel com setas em overlay */}
          <div className="relative group/carousel">
            {/* Seta Esquerda — aparece ao hover no desktop */}
            <button
              onClick={() => sliderRef.current?.scrollBy({ left: -316, behavior: 'smooth' })}
              className="hidden sm:flex absolute left-0 top-[45%] -translate-y-1/2 -translate-x-5 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Seta Direita — aparece ao hover no desktop */}
            <button
              onClick={() => sliderRef.current?.scrollBy({ left: 316, behavior: 'smooth' })}
              className="hidden sm:flex absolute right-0 top-[45%] -translate-y-1/2 translate-x-5 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100"
              aria-label="Próximo"
            >
              <ChevronRight size={22} />
            </button>

            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto pb-10 pt-4 snap-x snap-mandatory scrollbar-hide px-1 flex-nowrap"
            >
              {featuredProducts.length > 0 ? featuredProducts.map((product) => (
                <div key={product.id} className="shrink-0">
                  <ProductCard product={product} layout="vertical" />
                </div>
              )) : (
                <div className="w-full text-center p-10 bg-white border border-dashed rounded-xl">
                  <p className="text-gray-500">Nenhum passeio disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-14 bg-primary text-white">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20">
                <div className="flex flex-col items-center text-center gap-5 p-4">
                    <ShieldCheck size={48} strokeWidth={1.5} className="opacity-90" />
                    <div>
                        <h4 className="font-bold text-xl mb-2">Pagamento Seguro</h4>
                        <p className="text-sm opacity-80 px-4 leading-relaxed">Transações criptografadas e proteção antifraude.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center gap-5 p-4">
                    <Headphones size={48} strokeWidth={1.5} className="opacity-90" />
                    <div>
                        <h4 className="font-bold text-xl mb-2">Suporte 24/7</h4>
                        <p className="text-sm opacity-80 px-4 leading-relaxed">Equipe local pronta para te atender.</p>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center gap-5 p-4">
                    <CreditCard size={48} strokeWidth={1.5} className="opacity-90" />
                    <div>
                        <h4 className="font-bold text-xl mb-2">Parcele sem Juros</h4>
                        <p className="text-sm opacity-80 px-4 leading-relaxed">Facilidade para pagar suas férias em até 10x.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </PublicLayout>
  );
}