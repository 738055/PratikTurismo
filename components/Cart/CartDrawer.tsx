'use client';

import React from 'react';
import { useCart } from '@/app/contexts/CartContext';
import { X, Trash2, Calendar, Users, ArrowRight, ShoppingBag, ShoppingCart, Plus, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/app/lib/productUtils';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { isCartOpen: contextIsOpen, setIsCartOpen: setContextIsOpen, items = [], removeFromCart, cartTotal } = useCart();
  const router = useRouter();

  const showDrawer = isOpen !== undefined ? isOpen : contextIsOpen;
  
  const handleClose = () => {
    if (onClose) onClose();
    else setContextIsOpen(false);
  };

  if (!showDrawer) return null;

  const handleCheckout = () => {
    handleClose();
    router.push('/checkout');
  };

  // Função auxiliar para renderizar os Passageiros / Tarifas corretamente
  const renderPassengers = (item: any) => {
     if (item.selectedTiers && Object.keys(item.selectedTiers).length > 0 && item.product.pricingTiers) {
         const activeTiers = Object.entries(item.selectedTiers)
           .filter(([_, qty]) => (qty as number) > 0)
           .map(([tierId, qty]) => {
              const tierDef = item.product.pricingTiers?.find((t: any) => t.id === tierId);
              return `${qty}x ${tierDef?.name || 'Ingresso'}`;
           });
         return activeTiers.join(', ');
     }
     // Fallback padrão
     return `${item.adults + item.children} Passageiros`;
  };

  // Função auxiliar para renderizar os Extras com seus nomes reais
  const renderExtras = (item: any) => {
     if (!item.selectedExtras || Object.keys(item.selectedExtras).length === 0) return null;
     
     const extrasList = Object.entries(item.selectedExtras)
         .filter(([_, qty]) => (qty as number) > 0)
         .map(([key, qty]) => {
             const extraDef = item.product.extras?.find((e: any) => e.id === key || e.name === key);
             return `${qty}x ${extraDef?.name || key}`;
         });

     if (extrasList.length === 0) return null;

     return (
         <div className="mb-2 flex flex-wrap gap-1">
           {extrasList.map((ex, i) => (
              <span key={i} className="text-primary text-[10px] font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Plus size={10} /> {ex}
              </span>
           ))}
         </div>
     );
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary text-white">
           <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h2 className="font-black text-xl leading-none">Seu Carrinho</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{items.length} itens selecionados</p>
              </div>
           </div>
           <button 
            onClick={handleClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
           >
              <X size={24} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={48} className="text-gray-200" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">O carrinho está vazio</h3>
                 <p className="text-gray-500 text-sm mb-8">Que tal adicionar algumas experiências incríveis em Foz do Iguaçu agora?</p>
                 <button 
                   onClick={handleClose}
                   className="w-full bg-secondary text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-lg"
                 >
                   Explorar Passeios
                 </button>
              </div>
           ) : (
              items.map(item => (
                 <div key={item.internalId} className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm border border-gray-100">
                       {/* CORREÇÃO: Acesso via item.product */}
                       <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col">
                       <div className="flex justify-between items-start gap-2 mb-1">
                          {/* CORREÇÃO: Acesso via item.product */}
                          <h3 className="font-bold text-sm text-gray-800 leading-snug line-clamp-2">{item.product.name}</h3>
                          <button 
                             onClick={() => removeFromCart(item.internalId)}
                             className="text-gray-300 hover:text-red-500 transition-colors p-1"
                             title="Remover"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                       
                       <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 mb-2">
                          <span className="flex items-center gap-1 font-medium"><Calendar size={12} className="text-primary"/> {item.date}</span>
                          {item.time && <span className="flex items-center gap-1 font-medium"><Clock size={12} className="text-primary"/> {item.time}</span>}
                          <span className="flex items-center gap-1 font-medium"><Users size={12} className="text-primary"/> {renderPassengers(item)}</span>
                       </div>

                       {/* Extras dinâmicos */}
                       {renderExtras(item)}

                       <div className="mt-auto flex justify-between items-end">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Subtotal</span>
                          <span className="font-black text-secondary">{formatCurrency(item.subtotal || 0)}</span>
                       </div>
                    </div>
                 </div>
              ))
           )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
           <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Valor Total</span>
                    <span className="text-3xl font-black text-secondary">{formatCurrency(cartTotal)}</span>
                 </div>
                 <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-success/10 text-success text-[10px] font-bold rounded uppercase">Melhor Preço</span>
                 </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
              >
                Finalizar Compra <ArrowRight size={20} />
              </button>
              
              <button 
                 onClick={handleClose}
                 className="w-full text-center text-gray-400 text-xs font-bold mt-4 hover:text-primary transition-colors"
              >
                 Continuar Comprando
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;