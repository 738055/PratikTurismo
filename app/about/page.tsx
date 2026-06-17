import React from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Sobre Nós</h1>
        <p className="text-gray-600">
          A Pratik Turismo é a sua agência oficial em Foz do Iguaçu. 
          Nossa missão é proporcionar experiências inesquecíveis nas Cataratas, Paraguai e Argentina.
        </p>
      </div>
    </PublicLayout>
  );
}