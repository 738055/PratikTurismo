'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';

export const PratikFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-3xl font-black tracking-tighter text-white mb-4 block">
              Pratik<span className="text-orange-500">.</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Nossa missão é descomplicar a forma como você compra passeios e transfers. Experiências incríveis, a um clique de distância.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><Facebook size={18} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explorar</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/passeios" className="hover:text-orange-500 transition-colors">Ver Passeios</Link></li>
              <li><Link href="/transfers" className="hover:text-orange-500 transition-colors">Reservar Transfers</Link></li>
              <li><Link href="/pacotes" className="hover:text-orange-500 transition-colors">Pacotes Especiais</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Atendimento</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail size={16}/> contato@pratikturismo.com.br</li>
              <li className="flex items-start gap-2"><MapPin size={16} className="shrink-0"/> Av. Principal, 1000 - Foz do Iguaçu, PR</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pratik Turismo. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};