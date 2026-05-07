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
          ? 'mt-auto p-4 border-t border-gray-200 bg-gray-50/30 flex flex-col items-start'
          : 'w-full sm:w-[240px] p-5 flex flex-col justify-center items-start shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200 bg-gray-50/30'
      }
    >
      <span className="text-xs text-gray-500 font-medium mb-1">
        {isTransfer
          ? `Total ${isRoundtrip ? '(Ida e Volta)' : 'a partir de'}`
          : 'Preço por adulto a partir de'}
      </span>

      {product.compareAtPrice && product.compareAtPrice > displayPrice && (
        <span className="text-xs text-gray-400 line-through mb-0.5">
          {formatCurrency(product.compareAtPrice)}
        </span>
      )}

      <span className="text-2xl font-black text-gray-900 leading-none mb-1">
        {formatCurrency(displayPrice)}
      </span>

      <span className="text-xs text-[#00a650] font-bold mb-3">Até 10x sem juros</span>

      <button
        onClick={handleClick}
        className="w-full bg-[#00a650] hover:bg-[#008c44] text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors"
      >
        Comprar agora
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
        className="w-[280px] md:w-[300px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 snap-center hover:shadow-md transition-shadow duration-300 group cursor-pointer overflow-hidden"
      >
        {/* Imagem */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 shrink-0">
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 text-white hover:text-red-500 z-10 transition-colors drop-shadow-md"
          >
            <Heart size={22} strokeWidth={2} />
          </button>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 280px, 300px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <MapPin size={48} />
            </div>
          )}
        </div>

        {/* Conteúdo Central */}
        <div className="p-4 flex flex-col flex-1">
          <CategoryTag />
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <RatingBadge />
          <LocationLine />
          <TypeDetails />
          <Benefits />
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
      className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
    >
      {/* Imagem */}
      <div className="relative w-full sm:w-[280px] h-60 shrink-0 overflow-hidden bg-gray-100">
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 text-white hover:text-red-500 z-10 transition-colors drop-shadow-md"
        >
          <Heart size={22} strokeWidth={2} />
        </button>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 280px"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <MapPin size={48} />
          </div>
        )}
      </div>

      {/* Informações (Centro) */}
      <div className="flex-1 p-5 flex flex-col justify-start">
        <CategoryTag />
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <RatingBadge />
        <LocationLine />
        <TypeDetails />
        <Benefits />
      </div>

      {/* Bloco de Preço (Direita) */}
      <PricingBox isVertical={false} />
    </div>
  );
};
