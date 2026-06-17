'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';

export const PratikNavbar = () => {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-black tracking-tighter text-blue-900">
              Pratik<span className="text-orange-500">.</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/destinos" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Destinos</Link>
            <Link href="/passeios" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Passeios</Link>
            <Link href="/transfers" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Transfers</Link>
            <Link href="/contato" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Contato</Link>
          </div>

          {/* Ações (Carrinho e Login) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/carrinho" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart size={24} />
              {cart?.length > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
            <Link href="/login" className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg">
              <User size={18} />
              Entrar
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-orange-500 p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Adicione o menu mobile dropdown aqui se desejado, acionado por isOpen */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full">
           {/* Itens mobile */}
        </div>
      )}
    </nav>
  );
};