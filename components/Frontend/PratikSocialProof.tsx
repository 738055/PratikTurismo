'use client';

import React from 'react';
import { Star, Quote, Users, MapPin, CalendarCheck } from 'lucide-react';

interface Testimonial {
  name: string;
  origin: string;
  text: string;
  service: string;
}

// Depoimentos representativos — edite/conecte ao banco quando desejar.
const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Mariana Alves',
    origin: 'São Paulo, SP',
    service: 'Cataratas + Guia',
    text: 'Passeio impecável nas Cataratas. O guia conhecia cada detalhe e o transfer chegou no horário certinho. Recomendo de olhos fechados!',
  },
  {
    name: 'Carlos e Família',
    origin: 'Curitiba, PR',
    service: 'Transfer Aeroporto',
    text: 'Reservei o transfer pelo site em 2 minutos. Motorista pontual, veículo confortável e atendimento super atencioso com as crianças.',
  },
  {
    name: 'Júlia Fernandes',
    origin: 'Belo Horizonte, MG',
    service: 'City Tour + Itaipu',
    text: 'Organização nota 10. Receptivo cuidou de tudo: roteiro, ingressos e dicas locais. Senti que estava em boas mãos o tempo todo.',
  },
];

const STATS = [
  { icon: Users, value: '12.000+', label: 'Viajantes atendidos' },
  { icon: MapPin, value: '40+', label: 'Roteiros em Foz e região' },
  { icon: CalendarCheck, value: '4,9/5', label: 'Avaliação média' },
];

export const PratikSocialProof = () => {
  return (
    <section className="py-20 md:py-28 bg-primary-50/60">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-lg bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest mb-4">
            Quem viaja, recomenda
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-secondary tracking-tighter mb-4">
            Experiências reais de quem <span className="text-primary italic">conheceu Foz</span>
          </h2>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            Receptivo local, guias credenciados e transporte seguro — do aeroporto às Cataratas.
          </p>
        </div>

        {/* Métricas de confiança */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-16">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="bg-white rounded-3xl p-8 text-center shadow-soft border border-primary-100/60 transition-all duration-300 hover:shadow-premium hover:-translate-y-1"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon size={26} />
              </div>
              <p className="text-3xl font-black text-secondary tracking-tight">{value}</p>
              <p className="text-sm font-semibold text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="relative bg-white rounded-[2rem] p-8 shadow-soft border border-gray-100 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 flex flex-col"
            >
              <Quote size={36} className="text-primary/15 absolute top-6 right-6" aria-hidden="true" />
              <div className="flex items-center gap-1 mb-5 text-accent" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className="fill-accent" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-secondary/90 font-medium leading-relaxed mb-8 relative z-10">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-hill-gradient text-white flex items-center justify-center font-black text-lg shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-secondary tracking-tight leading-tight">{t.name}</p>
                  <p className="text-xs font-semibold text-gray-400">
                    {t.origin} · <span className="text-primary">{t.service}</span>
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
