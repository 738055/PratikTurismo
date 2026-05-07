import Link from 'next/link';
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <h2 className="text-4xl font-black text-gray-800 mb-4">Página não encontrada</h2>
      <p className="text-gray-500 mb-8">O destino que você procura não está no nosso mapa.</p>
      <Link href="/" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition-colors">
        Voltar para o Início
      </Link>
    </div>
  );
}