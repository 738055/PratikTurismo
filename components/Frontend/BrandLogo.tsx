import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LOGO_SRC = '/brand/logo.png';
const RATIO = 641 / 264; // proporção original do arquivo

interface BrandLogoProps {
  /** Altura do logo em px (a largura é calculada pela proporção original). */
  height?: number;
  /** Em fundos escuros, envolve o logo num selo claro para garantir contraste. */
  onDark?: boolean;
  priority?: boolean;
  className?: string;
  /** Quando false, renderiza só a imagem (sem <Link>). */
  asLink?: boolean;
}

export const BrandLogo = ({
  height = 40,
  onDark = false,
  priority = false,
  className = '',
  asLink = true,
}: BrandLogoProps) => {
  const width = Math.round(height * RATIO);

  const img = (
    <Image
      src={LOGO_SRC}
      alt="Pratik Turismo"
      width={width}
      height={height}
      priority={priority}
      className="h-auto w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
      style={{ height, width: 'auto' }}
    />
  );

  const content = onDark ? (
    <span className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 shadow-soft">
      {img}
    </span>
  ) : (
    img
  );

  if (!asLink) {
    return <span className={`inline-flex items-center group ${className}`}>{content}</span>;
  }

  return (
    <Link href="/" className={`inline-flex items-center group ${className}`} aria-label="Pratik Turismo — início">
      {content}
    </Link>
  );
};
