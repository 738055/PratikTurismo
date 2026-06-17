'use client';

import React from 'react';
import { Search, MapPin, Calendar, ArrowRight, ShieldCheck, CreditCard, Clock } from 'lucide-react';

export const PratikHero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 bg-secondary overflow-hidden">
      {/* Background Image with optimized overlay */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center animate-fadeIn" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-secondary/80 via-secondary/40 to-secondary" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 animate-fadeIn">
            Experiências Inesquecíveis em Foz
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] animate-slide-in-right">
            Sua viagem de forma <span className="text-brand-gradient italic">Pratik.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Reserve passeios, experiências e transfers com segurança. A melhor agência local agora no seu bolso.
          </p>

          {/* Search Card Redesigned */}
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-3xl shadow-premium flex flex-col md:flex-row gap-2 transition-all hover:shadow-premium-hover">
            <div className="flex-[1.5] flex items-center bg-gray-50 rounded-2xl px-5 py-4 group transition-colors hover:bg-white border border-transparent hover:border-gray-100">
              <MapPin className="text-primary mr-4" size={22} />
              <div className="text-left w-full">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Destino</label>
                <input 
                  type="text" 
                  placeholder="Para onde você quer ir?" 
                  className="w-full bg-transparent outline-none text-secondary font-bold placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-5 py-4 group transition-colors hover:bg-white border border-transparent hover:border-gray-100">
              <Calendar className="text-primary mr-4" size={22} />
              <div className="text-left w-full">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Quando</label>
                <input 
                  type="text" 
                  placeholder="Selecione a data"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  className="w-full bg-transparent outline-none text-secondary font-bold placeholder-gray-400"
                />
              </div>
            </div>
            <button className="bg-accent hover:bg-accent-dark text-white px-10 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95 group">
              <Search size={22} className="group-hover:scale-110 transition-transform" />
              <span>EXPLORAR</span>
            </button>
          </div>
        </div>

        {/* Trust features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
            <div className="flex items-center justify-center gap-3 text-white/60 hover:text-white transition-colors cursor-default">
                <ShieldCheck size={20} className="text-accent" />
                <span className="text-sm font-bold tracking-tight">Pagamento 100% Seguro</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/60 hover:text-white transition-colors cursor-default">
                <Clock size={20} className="text-accent" />
                <span className="text-sm font-bold tracking-tight">Confirmação Imediata</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/60 hover:text-white transition-colors cursor-default">
                <CreditCard size={20} className="text-accent" />
                <span className="text-sm font-bold tracking-tight">Até 10x sem Juros</span>
            </div>
        </div>
      </div>
      
      {/* Wave bottom decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-px">
        <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120c67.85-23.1,144.33-30.62,214.34-12.17,79,20.8,161.88,61.81,241.87,78.25" className="fill-gray-50"></path>
        </svg>
      </div>
    </section>
  );
};