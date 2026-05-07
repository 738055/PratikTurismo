// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import TrackingProvider from './TrackingProvider';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reservaturismo.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Reserva Turismo | Passeios e Transfers em Foz do Iguaçu',
    template: '%s | Reserva Turismo',
  },
  description:
    'A melhor agência de turismo em Foz do Iguaçu. Reserve passeios nas Cataratas, City Tour, transfers de aeroporto e muito mais. Cancele grátis, parcele em até 10x.',
  keywords: [
    'passeios foz do iguaçu',
    'cataratas do iguaçu',
    'transfer aeroporto foz',
    'turismo foz do iguaçu',
    'agência turismo foz',
    'city tour foz',
    'parque das aves',
    'itaipu binacional',
    'compras paraguai',
  ],
  authors: [{ name: 'Reserva Turismo', url: BASE_URL }],
  creator: 'Reserva Turismo',
  publisher: 'Reserva Turismo',
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'Reserva Turismo',
    title: 'Reserva Turismo | Passeios e Transfers em Foz do Iguaçu',
    description:
      'Reserve passeios nas Cataratas, transfers e atrações em Foz do Iguaçu. Cancelamento grátis e parcelamento em até 10x.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Reserva Turismo — Foz do Iguaçu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reserva Turismo | Foz do Iguaçu',
    description: 'Reserve passeios, transfers e atrações em Foz do Iguaçu.',
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <TrackingProvider />
      </body>
    </html>
  );
}