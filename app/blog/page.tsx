'use client';

import React from 'react';
import { PublicLayout } from '@/components/Layout/PublicLayout';
import { useContent } from '@/app/contexts/ContentContext';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogListPage() {
  const { blogPosts } = useContent();
  // CORREÇÃO: Pega os que estão "active" OU "published"
  const activePosts = blogPosts.filter(p => p.active || (p as any).published === true);

  return (
    <PublicLayout>
      {/* SEO Header Structure */}
      <div className="bg-gray-50 py-12 border-b border-gray-200">
         <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-black text-gray-800 mb-4">Dicas da Fronteira</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
               As melhores dicas de compras, gastronomia e passeios em Foz do Iguaçu, Paraguai e Argentina.
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activePosts.map(post => (
               <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                  <div className="h-56 overflow-hidden relative">
                     <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     />
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Dicas
                     </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                     <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {post.date}</span>
                        <span className="flex items-center gap-1"><User size={12}/> {post.author}</span>
                     </div>
                     
                     <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors leading-tight">
                           {post.title}
                        </h2>
                     </Link>
                     
                     <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                     </p>
                     
                     <div className="mt-auto pt-4 border-t border-gray-100">
                        <Link 
                           href={`/blog/${post.slug}`} 
                           className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                        >
                           Ler matéria completa <ArrowRight size={16}/>
                        </Link>
                     </div>
                  </div>
               </article>
            ))}
         </div>
      </div>
    </PublicLayout>
  );
};