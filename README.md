# Pratik Turismo — ERP + E-commerce

Plataforma de turismo (Next.js 16 + Supabase + Stripe) com loja pública de
passeios/ingressos/transfers e um ERP administrativo (reservas, financeiro,
fornecedores, afiliados, ordens de serviço).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** (Postgres, Auth, Storage, RLS)
- **Stripe** (pagamentos, Connect para splits de fornecedores/afiliados)
- **Tailwind CSS**, Radix UI, Framer Motion
- **Nodemailer / Resend** (e-mails transacionais e remarketing)

## Rodar localmente

**Pré-requisitos:** Node.js 18+ e um projeto Supabase.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env.local` a partir do exemplo e preencha as variáveis:
   ```bash
   cp .env.local.example .env.local
   ```
3. Aplique as migrations do Supabase (pasta `supabase-migrations/`) no seu
   projeto — comece por `00_INIT_PRATIK_DB_COMPLETO.sql`.
4. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```

## Build de produção

```bash
npm run build
npm run start
```

## Variáveis de ambiente

Veja [`.env.local.example`](.env.local.example) para a lista completa. As
**obrigatórias** são:

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role (operações de servidor) |
| `NEXT_PUBLIC_SITE_URL` | Domínio público (SEO/sitemap) |
| `NEXT_PUBLIC_APP_URL` | Domínio da app (chamadas internas) |
| `REVALIDATION_SECRET_TOKEN` | Token para revalidação ISR on-demand |
| `CRON_SECRET` | Protege os endpoints de cron |

> As chaves do **Stripe** e do **SMTP** são configuradas no painel admin
> (tabela `system_settings`), não via env. `STRIPE_SECRET_KEY` no env é apenas
> fallback opcional.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure todas as variáveis de ambiente acima no projeto.
3. O arquivo [`vercel.json`](vercel.json) já define os **Cron Jobs**:
   - `/api/cron` — limpeza de reservas abandonadas (a cada 15 min).
   - `/api/cron/remarketing` — e-mails de remarketing (diário, 13:00 UTC).

   > ⚠️ No plano **Hobby** da Vercel os crons são limitados a 1×/dia. Ajuste o
   > `schedule` em `vercel.json` se necessário.
4. Configure o **webhook do Stripe** apontando para `/api/webhooks` e salve o
   `stripe_webhook_secret` em System Settings do ERP.

## Estrutura

- `app/` — rotas (loja pública, `admin/` ERP, `api/` rotas de servidor).
- `components/` — componentes de UI e do admin.
- `lib/` — clientes Supabase/Stripe e utilitários.
- `supabase-migrations/` — schema e seeds do banco.
