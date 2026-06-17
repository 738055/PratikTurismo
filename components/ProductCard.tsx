'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, MapPin, Clock, Heart, Users, Luggage, Star, ArrowRight } from 'lucide-react';
import { Product } from '@/app/types';
import { calculateBasePrice, getRatingLabel, formatCurrency } from '@/app/lib/productUtils';
import { trackSelectItem } from '@/app/lib/tracking';

interface ProductCardProps {
  product: Product;
  layout?: 'horizontal' | 'vertical';
  isRoundtrip?: boolean;
  onBookTransfer?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  layout = 'horizontal',
  isRoundtrip,
  onBookTransfer,
}) => {
  const router = useRouter();

  const isTransfer = product.type === 'transfer';
  const isPrivate = product.transferDetails?.serviceType === 'private';

  const basePrice = calculateBasePrice(product);
  const displayPrice = isRoundtrip ? basePrice * 2 : basePrice;

  const hasRating = product.rating != null;
  const ratingLabel = hasRating ? getRatingLabel(product.rating!) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackSelectItem({ id: product.id, name: product.name, price: basePrice, type: product.type });
    if (isTransfer && onBookTransfer) {
      onBookTransfer(product);
    } else {
      router.push(`/tours/${product.slug}`);
    }
  };

  const firstRoute = product.transferDetails?.routes?.[0];
  const routeLabel = firstRoute
    ? `${firstRoute.originCode ?? firstRoute.originName} → ${firstRoute.destinationName}`
    : product.transferDetails?.airportCode
    ? `${product.transferDetails.airportCode} → ${product.transferDetails.city ?? 'Destino'}`
    : null;

  // ─── Micro-componentes reutilizados em ambos os layouts ───────────────────

  const CategoryTag = () => {
    const label = product.tags?.[0] ?? product.type;
    return (
      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 block">
        {label}
      </span>
    );
  };

  const RatingBadge = () => {
    const displayRating = product.rating ?? 0;
    const displayLabel = hasRating ? ratingLabel : null;
    const displayCount = product.reviewsCount ?? 0;
    const fullStars = Math.floor(displayRating / 2);
    const hasHalfStar = (displayRating / 2) % 1 >= 0.5;

    return (
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-[#11224D] text-white font-bold text-sm px-2 py-1 rounded-md leading-none">
          {displayRating.toFixed(1)}
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={
                i < fullStars
                  ? 'text-yellow-400 fill-yellow-400'
                  : i === fullStars && hasHalfStar
                  ? 'text-yellow-400 fill-yellow-400/50'
                  : 'text-gray-300'
              }
            />
          ))}
        </div>
        {displayLabel && <span className="text-sm font-bold text-[#11224D]">{displayLabel}</span>}
        <span className="text-xs text-gray-500">
          {displayCount > 0 ? `${displayCount} avaliações` : 'Sem avaliações'}
        </span>
      </div>
    );
  };

  const LocationLine = () => {
    const locationText = isTransfer
      ? (product.transferDetails?.city ?? null)
      : (product.location ?? null);
    if (!locationText) return null;
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
        <MapPin size={13} className="text-gray-400 shrink-0" />
        <span className="line-clamp-1">{locationText}</span>
      </div>
    );
  };

  const TypeDetails = () => (
    <div className="space-y-1.5">
      {isTransfer ? (
        <>
          {routeLabel && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
              <ArrowRight size={14} className="text-purple-500 shrink-0" />
              <span className="line-clamp-1">{routeLabel}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {product.transferDetails?.passengerCapacity && (
              <span className="flex items-center gap-1">
                <Users size={14} /> Até {product.transferDetails.passengerCapacity} pax
              </span>
            )}
            {product.transferDetails?.luggageCapacity != null && (
              <span className="flex items-center gap-1">
                <Luggage size={14} /> {product.transferDetails.luggageCapacity} malas
              </span>
            )}
          </div>
          <div className="text-xs text-indigo-600 font-bold uppercase tracking-wide">
            Transfer {isPrivate ? 'Privativo' : 'Compartilhado'}
          </div>
        </>
      ) : (
        <>
          {product.duration && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock size={14} className="text-gray-400" /> {product.duration}
            </div>
          )}
          {product.guideLanguages && product.guideLanguages.length > 0 && (
            <div className="text-sm text-gray-500">
              <span className="text-gray-400">Idiomas:</span> {product.guideLanguages.join(', ')}
            </div>
          )}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.features.slice(0, 3).map((f, i) => (
                <span key={i} className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check size={11} /> {f}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const Benefits = () => (
    <>
      {product.is_free_cancellation && (
        <div className="flex items-center gap-1.5 text-sm text-[#00a650] font-semibold mt-2">
          <Check size={16} strokeWidth={3} /> Cancelamento grátis
        </div>
      )}
    </>
  );

  const PricingBox = ({ isVertical }: { isVertical: boolean }) => (
    <div
      className={
        isVertical
          ? 'mt-auto p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col items-start'
          : 'w-full sm:w-[260px] p-6 flex flex-col justify-center items-start shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50/50'
      }
    >
      <div className="mb-4">
        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">
          {isTransfer
            ? `Total ${isRoundtrip ? '(Ida e Volta)' : 'a partir de'}`
            : 'Por pessoa a partir de'}
        </span>

        <div className="flex items-baseline gap-2">
          {product.compareAtPrice && product.compareAtPrice > displayPrice && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
          <span className="text-3xl font-black text-secondary tracking-tighter leading-none">
            {formatCurrency(displayPrice)}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-1 text-success font-bold text-xs uppercase tracking-tight">
          <CreditCard size={12} />
          <span>Até 10x sem juros</span>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
      >
        <span>RESERVAR AGORA</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  // ============================================================
  // LAYOUT VERTICAL (Home — Carrossel)
  // ============================================================
  if (layout === 'vertical') {
    return (
      <div
        onClick={handleClick}
        className="w-[280px] md:w-[320px] h-full flex flex-col bg-white rounded-3xl shadow-soft border border-gray-100 snap-center hover:shadow-premium transition-all duration-500 group cursor-pointer overflow-hidden"
      >
        {/* Imagem */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 z-20 transition-all shadow-lg flex items-center justify-center"
          >
            <Heart size={20} strokeWidth={2.5} />
          </button>
          
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 280px, 320px"
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <MapPin size={48} />
            </div>
          )}

          {product.is_free_cancellation && (
            <div className="absolute bottom-4 left-4 z-20 bg-success/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
              Cancelamento Grátis
            </div>
          )}
        </div>

        {/* Conteúdo Central */}
        <div className="p-6 flex flex-col flex-1">
          <CategoryTag />
          <h3 className="text-xl font-black text-secondary line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <RatingBadge />
          <div className="mt-2 space-y-3">
            <LocationLine />
            <TypeDetails />
          </div>
        </div>

        {/* Pricing Box — base */}
        <PricingBox isVertical={true} />
      </div>
    );
  }

  // ============================================================
  // LAYOUT HORIZONTAL (Busca / Lista)
  // ============================================================
  return (
    <div
      onClick={handleClick}
      className="flex flex-col sm:flex-row bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-premium transition-all duration-500 group cursor-pointer"
    >
      {/* Imagem */}
      <div className="relative w-full sm:w-[320px] h-64 sm:h-auto shrink-0 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 z-20 transition-all shadow-lg flex items-center justify-center"
        >
          <Heart size={20} strokeWidth={2.5} />
        </button>

        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <MapPin size={48} />
          </div>
        )}

        {product.is_free_cancellation && (
          <div className="absolute bottom-4 left-4 z-20 bg-success/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
            Cancelamento Grátis
          </div>
        )}
      </div>

      {/* Informações (Centro) */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-start">
        <CategoryTag />
        <h3 className="text-2xl font-black text-secondary line-clamp-2 mb-4 leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <RatingBadge />
        <div className="mt-4 space-y-4 max-w-lg">
          <LocationLine />
          <TypeDetails />
        </div>
      </div>

      {/* Bloco de Preço (Direita) */}
      <PricingBox isVertical={false} />
    </div>
  );
};
