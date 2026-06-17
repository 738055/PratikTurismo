'use client';

import React, { useRef } from 'react';
import { Star, ArrowRight, ShieldCheck, Headphones, CreditCard, ChevronLeft, ChevronRight, Zap, Trophy, Heart, Users, Map, Plane } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContent } from '@/app/contexts/ContentContext';
import PromoModal from '@/components/PromoModal';
import { ProductCard } from '@/components/ProductCard';
import { PratikNavbar } from '@/components/Frontend/PratikNavbar';
import { PratikHero } from '@/components/Frontend/PratikHero';
import { PratikSocialProof } from '@/components/Frontend/PratikSocialProof';
import { PratikFooter } from '@/components/Frontend/PratikFooter';

export default function HomePage() {
  const { getFeaturedProducts, categories } = useContent(); 
  const featuredProducts = getFeaturedProducts();
  const router = useRouter();
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (slug: string) => {
    switch(slug) {
      case 'transfers': return <Plane size={24} />;
      case 'passeios': return <Map size={24} />;
      case 'ingressos': return <Zap size={24} />;
      case 'combos': return <Trophy size={24} />;
      default: return <Star size={24} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <PratikNavbar />
      
      <main className="flex-grow">
        <PratikHero />

      {/* --- MODAL PROMOCIONAL --- */}
      <PromoModal />

      {/* --- QUICK CATEGORIES REDESIGNED --- */}
      <section className="relative z-30 -mt-16 mb-20">
        <div className="container mx-auto px-4">
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-gray-100 p-8 md:p-10 flex flex-wrap justify-center md:justify-between items-center gap-8">
                {categories.length > 0 ? categories.slice(0, 5).map((cat) => (
                    <div 
                        key={cat.id} 
                        onClick={() => router.push(cat.slug === 'transfers' ? '/transfers/search' : `/tours/search?category=${cat.slug}`)}
                        className="flex flex-col items-center gap-4 cursor-pointer group w-28 md:w-auto"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gray-50 text-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-soft group-hover:shadow-premium group-hover:shadow-primary/30 group-hover:-translate-y-1">
                            {getCategoryIcon(cat.slug)}
                        </div>
                        <span className="text-xs md:text-sm font-black text-gray-500 group-hover:text-primary uppercase tracking-[0.1em] text-center transition-colors">
                          {cat.label}
                        </span>
                    </div>
                )) : (
                    <div className="w-full flex justify-center py-4">
                      <div className="h-4 w-48 bg-gray-100 animate-pulse rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS --- */}
      <section className="py-12 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
             <div className="max-w-xl">
                 <span className="inline-block px-3 py-1 rounded-lg bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest mb-4">
                   Destaques da Região
                 </span>
                 <h2 className="text-4xl md:text-6xl font-black text-secondary tracking-tighter leading-[0.9] mb-6">
                   O que fazer <br/>em <span className="text-primary italic">Foz?</span>
                 </h2>
                 <p className="text-gray-500 text-lg font-medium leading-relaxed">
                   Selecionamos as experiências mais incríveis para você aproveitar o melhor da Terra das Cataratas.
                 </p>
             </div>
             <Link href="/tours/search" className="bg-white hover:bg-gray-50 text-secondary border-2 border-gray-100 font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-soft hover:shadow-premium active:scale-95 shrink-0 group">
                Explorar Tudo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          {/* Carrossel com setas em overlay */}
          <div className="relative group/carousel">
            {/* Seta Esquerda */}
            <button
              onClick={() => sliderRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-14 h-14 rounded-full bg-white shadow-premium items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 scale-90 group-hover/carousel:scale-100"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Seta Direita */}
            <button
              onClick={() => sliderRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-14 h-14 rounded-full bg-white shadow-premium items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 scale-90 group-hover/carousel:scale-100"
              aria-label="Próximo"
            >
              <ChevronRight size={28} />
            </button>

            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto pb-16 pt-4 snap-x snap-mandatory scrollbar-hide px-2 flex-nowrap"
            >
              {featuredProducts.length > 0 ? featuredProducts.map((product) => (
                <div key={product.id} className="shrink-0">
                  <ProductCard product={product} layout="vertical" />
                </div>
              )) : (
                <div className="w-full text-center p-20 bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                  <p className="text-gray-400 font-bold">Nenhum passeio disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- PROVA SOCIAL / DEPOIMENTOS --- */}
      <PratikSocialProof />

      {/* --- WHY CHOOSE US REDESIGNED --- */}
      <section className="py-24 bg-secondary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                Por que escolher a <span className="text-primary italic">Pratik?</span>
              </h2>
              <p className="text-white/60 font-medium">Sua segurança e conforto são nossa prioridade número um.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={40} />
                    </div>
                    <h4 className="font-black text-white text-2xl mb-4 tracking-tight">Pagamento Seguro</h4>
                    <p className="text-white/50 font-medium leading-relaxed">Sua segurança em primeiro lugar. Transações 100% criptografadas e seguras.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-20 h-20 rounded-3xl bg-accent/20 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                      <Headphones size={40} />
                    </div>
                    <h4 className="font-black text-white text-2xl mb-4 tracking-tight">Suporte Local 24/7</h4>
                    <p className="text-white/50 font-medium leading-relaxed">Nossa equipe em Foz está sempre pronta para ajudar você em qualquer momento.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/10 transition-colors">
                    <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                      <CreditCard size={40} />
                    </div>
                    <h4 className="font-black text-white text-2xl mb-4 tracking-tight">Parcelamento Fácil</h4>
                    <p className="text-white/50 font-medium leading-relaxed">Planeje sua viagem com tranquilidade e parcele seus passeios em até 10x sem juros.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- APP CTA / NEWSLETTER PLACEHOLDER --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="max-w-xl relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
                Leve a Pratik no <br/>seu bolso!
              </h2>
              <p className="text-white/80 text-lg font-medium mb-10">
                Receba ofertas exclusivas, cupons de desconto e gerencie suas reservas diretamente pelo nosso site.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-secondary text-white font-black py-4 px-10 rounded-2xl shadow-premium hover:shadow-premium-hover active:scale-95 transition-all">
                  MINHAS RESERVAS
                </button>
                <button className="bg-white text-primary font-black py-4 px-10 rounded-2xl shadow-premium hover:shadow-premium-hover active:scale-95 transition-all">
                  CENTRAL DE AJUDA
                </button>
              </div>
            </div>

            <div className="hidden lg:block relative z-10">
              <div className="w-72 h-[500px] bg-secondary rounded-[3rem] border-[12px] border-secondary/20 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/80" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-pulse" />
                <div className="p-6 relative z-10">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
                  <div className="w-full h-40 bg-white/10 rounded-2xl mb-4" />
                  <div className="w-3/4 h-4 bg-white/10 rounded-full mb-2" />
                  <div className="w-1/2 h-4 bg-white/10 rounded-full mb-8" />
                  <div className="w-full h-12 bg-primary rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      
      <PratikFooter />
    </div>
  );
}