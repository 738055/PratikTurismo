'use client';

import React from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

export const PratikHero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-blue-900 overflow-hidden">
      {/* Imagem de Fundo (Ajuste o caminho da imagem ou use uma textura) */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-blue-900 via-transparent to-blue-900/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 animate-fade-in-up">
          Sua viagem de forma <span className="text-orange-500">Pratik.</span>
        </h1>
        <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 font-light">
          Reserve passeios, experiências e transfers com segurança e praticidade. Tudo na palma da sua mão.
        </p>

        {/* Card de Busca Principal */}
        <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl md:rounded-full px-4 py-3">
            <MapPin className="text-gray-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Para onde você quer ir?" 
              className="w-full bg-transparent outline-none text-gray-700 font-medium placeholder-gray-400"
            />
          </div>
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl md:rounded-full px-4 py-3">
            <Calendar className="text-gray-400 mr-3" size={20} />
            <input 
              type="date" 
              className="w-full bg-transparent outline-none text-gray-700 font-medium"
            />
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl md:rounded-full font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30">
            <Search size={20} />
            Explorar
          </button>
        </div>

        <div className="mt-12 text-sm text-blue-200 font-medium tracking-wide uppercase">Mais de 10.000 clientes satisfeitos</div>
      </div>
    </section>
  );
};