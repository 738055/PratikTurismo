import React from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Fale Conosco</h1>
        <p className="text-gray-600">Email: reservas@reservaturismo.com</p>
        <p className="text-gray-600">Telefone: 0800 123 4567</p>
        <p className="text-gray-600">WhatsApp: (45) 99999-9999</p>
      </div>
    </PublicLayout>
  );
}