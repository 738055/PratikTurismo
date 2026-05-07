'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, User, X, MapPin, 
  Twitter, Youtube, Phone, Mail, Instagram, Facebook, 
  Menu, Info, FileText 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useCart } from '@/app/contexts/CartContext';
import { useContent } from '@/app/contexts/ContentContext';
import { CartDrawer } from '../Cart/CartDrawer';
import PartnersCarousel from '@/components/PartnersCarousel'; // ADICIONE ESTA LINHA
import * as Icons from 'lucide-react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  // Safety check for items
  const { items = [], setIsCartOpen } = useCart();
  const { categories = [], companyInfo } = useContent();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tours/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === 'blog') {
      router.push('/blog');
    } else if (categorySlug === 'transfers') {
      router.push('/transfers/search');
    } else {
      router.push(`/tours/search?category=${encodeURIComponent(categorySlug)}`);
    }
    setIsMenuOpen(false);
  };

  // Função auxiliar para renderizar ícones dinamicamente
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className={className} size={26} strokeWidth={1.5} /> : <Icons.HelpCircle className={className} size={26} />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
      <CartDrawer />

      {/* Header Principal */}
      <header className="bg-white py-4 relative z-50 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Topo Mobile: Logo + Botões de Ação Mobile */}
          <div className="flex w-full md:w-auto items-center justify-between order-1">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="text-primary font-black text-3xl tracking-tighter flex items-center">
                 <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-800 rounded-tr-2xl rounded-bl-2xl mr-2 shadow-lg shadow-blue-200"></div>
                 <div className="flex flex-col leading-none">
                   <span className="text-secondary text-2xl">RESERVA</span>
                   <span className="text-primary text-sm font-bold tracking-[0.2em]">TURISMO</span>
                 </div>
              </div>
            </Link>

            {/* Botões Mobile (Carrinho e Menu) */}
            <div className="flex items-center gap-4 md:hidden">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-gray-600 hover:text-primary transition-colors"
              >
                <ShoppingCart size={26} />
                {items && items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-urgent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </button>
              
              {/* Botão Hamburger que abre o menu */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-primary focus:outline-none transition-colors"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Barra de Busca (Desktop) */}
          <div className="hidden md:block order-2 flex-1 max-w-3xl mx-auto">
             <form onSubmit={handleSearch} className="relative w-full">
               <input 
                 type="text" 
                 placeholder={t('Buscar passeios, transfers...') || "Buscar passeios, transfers..."}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-gray-100 border-none rounded-lg py-3.5 px-6 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700 font-medium placeholder-primary/50"
               />
               <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors p-1.5 hover:bg-white rounded-full">
                 <Search size={24} />
               </button>
             </form>
          </div>

          {/* Ações do Usuário (Desktop) */}
          <div className="hidden md:flex order-3 items-center gap-5">
             {/* Adicionado o Link em volta do ícone de User */}
             <Link href="/login" className="flex items-center justify-center cursor-pointer hover:text-primary transition-colors">
                <User size={28} className="text-gray-700 stroke-[1.5]" />
             </Link>
             
             <Link href="/minhas-reservas" className="flex items-center px-6 py-2 border-2 border-secondary text-secondary font-bold rounded-full hover:bg-secondary hover:text-white transition-all text-sm whitespace-nowrap">
                Minhas Reservas
             </Link>
             
             <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 hover:text-primary transition-colors relative"
             >
                <ShoppingCart size={28} className="text-gray-700 stroke-[1.5]" />
                {items && items.length > 0 && (
                   <span className="absolute -top-1.5 -right-1.5 bg-urgent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                      {items.length}
                   </span>
                )}
             </button>
          </div>
        </div>

        {/* Busca Mobile (Aparece embaixo do header no celular) */}
        <div className="md:hidden px-4 pb-4 pt-2">
           <form onSubmit={handleSearch} className="relative w-full">
             <input 
               type="text" 
               placeholder="Buscar passeios..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-gray-100 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
             />
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
               <Search size={20} />
             </button>
           </form>
        </div>

        {/* --- MENU MOBILE EXPANDIDO --- */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl z-50 animate-fadeIn">
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Botão Principal Mobile */}
              <Link 
                href="/minhas-reservas" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-3 bg-secondary text-white rounded-lg font-bold w-full hover:bg-secondary/90 transition-colors"
              >
                <User size={20} /> Minhas Reservas
              </Link>
              
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">Categorias</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.filter(c => c.active).map((cat) => (
                    <div 
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-100"
                    >
                      {/* Renderiza ícone pequeno se disponível, senão usa padrão */}
                      {(() => {
                        const Icon = (Icons as any)[cat.icon] || Icons.Circle;
                        return <Icon size={16} className="text-primary" />;
                      })()}
                      <span className="text-sm text-gray-700 font-medium">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 border-t pt-3">
                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-600 font-medium">
                  <Info size={18} /> Sobre Nós
                </Link>
                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-600 font-medium">
                  <Phone size={18} /> Fale Conosco
                </Link>
                 <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-600 font-medium">
                  <FileText size={18} /> Dicas da Fronteira
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Nav Principal (Desktop e Scroll Mobile) */}
      <nav className="bg-primary shadow-md border-t border-blue-400/30 sticky top-0 z-40">
         <div className="container mx-auto px-4">
            <ul className="flex justify-between items-center text-white overflow-x-auto scrollbar-hide py-1 md:py-0 no-scrollbar">
               {categories.filter(c => c.active).sort((a,b) => a.order - b.order).map((cat) => (
                  <li 
                      key={cat.id} 
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex flex-col items-center justify-center py-3 md:py-4 px-4 md:px-6 hover:bg-white/10 cursor-pointer transition-colors min-w-[90px] md:min-w-0 group flex-shrink-0"
                  >
                      {renderIcon(cat.icon, "mb-2 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform")}
                      <span className="text-[10px] md:text-sm font-bold uppercase tracking-wide whitespace-nowrap">{cat.label}</span>
                  </li>
               ))}
            </ul>
         </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {/* Carrossel de Parceiros antes do Rodapé */}
      <PartnersCarousel />

      {/* Footer */}
      <footer className="bg-secondary text-gray-300 pt-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">Explorar</h4>
                 <ul className="space-y-3 text-sm">
                   <li><Link href="/tours/search" className="hover:text-primary transition-colors">Passeios em Foz</Link></li>
                   <li><Link href="/transfers/search" className="hover:text-primary transition-colors">Transfers</Link></li>
                   <li><Link href="/categories" className="hover:text-primary transition-colors">Categorias</Link></li>
                   <li><Link href="/blog" className="hover:text-primary transition-colors">Dicas da Fronteira</Link></li>
                 </ul>
              </div>
              
              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">Institucional</h4>
                 <ul className="space-y-3 text-sm">
                   <li><Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                   <li><Link href="/contact" className="hover:text-primary transition-colors">Fale Conosco</Link></li>
                   <li><Link href="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                   <li><Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
                 </ul>
              </div>

              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">Contato</h4>
                 <ul className="space-y-3 text-sm">
                    {companyInfo.address && (
                      <li className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary shrink-0"/> {companyInfo.address}
                      </li>
                    )}
                    {companyInfo.phone && (
                      <li className="flex items-center gap-2 text-white font-bold">
                        <Phone size={16} className="text-primary shrink-0"/> {companyInfo.phone}
                      </li>
                    )}
                    {companyInfo.contact_email && (
                      <li className="flex items-center gap-2">
                        <Mail size={16} className="text-primary shrink-0"/> {companyInfo.contact_email}
                      </li>
                    )}
                 </ul>
              </div>
              
              {/* Atualização da Coluna Redes Sociais (Linkadas) */}
              <div>
                 <h4 className="text-white font-bold mb-6 text-lg">Redes Sociais</h4>
                 <div className="flex gap-4">
                    <a href="https://instagram.com/sua_pagina" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"><Instagram size={20}/></a>
                    <a href="https://facebook.com/sua_pagina" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"><Facebook size={20}/></a>
                    <a href="https://twitter.com/sua_pagina" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors text-white"><Twitter size={20}/></a>
                    <a href="https://youtube.com/sua_pagina" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors text-white"><Youtube size={20}/></a>
                 </div>
              </div>
           </div>
           
           <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
              <p>
                &copy; {new Date().getFullYear()} {companyInfo.company_name}. Todos os direitos reservados.
                {companyInfo.cnpj && ` CNPJ: ${companyInfo.cnpj}`}
              </p>
              <p className="mt-1">Feito com ❤️ na Terra das Cataratas.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};