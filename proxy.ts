import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que APENAS um 'admin' pode aceder.
const adminOnlyPaths = [
  '/admin/finance',
  '/admin/reports',
  '/admin/settings',
  '/admin/customers',
  '/admin/coupons',
  '/admin/users'
];

// URLs de spam/hack do site antigo — retornar 410 Gone para limpar índice do Google
const SPAM_PATTERNS = [
  /^\/(enjoyable|when-dating|dating|asian-dating|wedding|eastern|western|relationship)/i,
  /^\/(how-to-|best-way-to-|top-\d+-)(?!.*cataratas|.*iguacu|.*foz)/i,
  /^\/(wp-content|wp-admin|wp-includes|wp-login|xmlrpc)/i,
  /^\/(tag|author|feed)\//i,
  /^\/.+-beliefs?\//i,
  /^\/.+-lifestyle\//i,
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 410 Gone para URLs de spam do site antigo
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse('Gone', { status: 410 });
    }
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const url = req.nextUrl.clone();

  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    
    if (!session) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    let role = session.user.user_metadata?.role;

    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      role = profile?.role;
    }

    // 1. Bloqueio geral se não for nem admin nem supplier
    if (role !== 'admin' && role !== 'supplier') {
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'unauthorized'); 
      return NextResponse.redirect(url);
    }

    // 2. 🔒 AJUSTE DE SEGURANÇA: Bloqueio granular para suppliers
    if (role === 'supplier' && adminOnlyPaths.some(p => req.nextUrl.pathname.startsWith(p))) {
        // Se um supplier tenta aceder a uma página de admin, redireciona para o dashboard dele
        url.pathname = '/admin/supplier-dashboard';
        url.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(url);
    }
  }

  if (req.nextUrl.pathname === '/admin/login' && session) {
      let role = session.user.user_metadata?.role;
       if (!role) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          role = profile?.role;
       }
      url.pathname = role === 'supplier' ? '/admin/supplier-dashboard' : '/admin/dashboard';
      return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Spam patterns — match potenciais URLs de hack para retornar 410
    '/enjoyable:path*',
    '/when-dating:path*',
    '/dating:path*',
    '/asian-dating:path*',
    '/wedding:path*',
    '/eastern:path*',
    '/western:path*',
    '/relationship:path*',
    '/how-to-:path*',
    '/best-way-to-:path*',
    '/wp-content/:path*',
    '/wp-admin/:path*',
    '/wp-includes/:path*',
    '/wp-login:path*',
    '/xmlrpc:path*',
    '/tag/:path*',
    '/author/:path*',
    '/feed/:path*',
  ],
};