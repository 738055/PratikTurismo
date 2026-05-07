-- Adiciona colunas para o sistema de afiliados na tabela 'partners'
ALTER TABLE public.partners
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN commission_percent NUMERIC;

-- Adiciona a coluna 'affiliate_id' na tabela 'bookings' para rastrear o afiliado
ALTER TABLE public.bookings
ADD COLUMN affiliate_id UUID REFERENCES public.partners(id);

-- Opcional: Adiciona um índice na nova coluna para otimizar as buscas
CREATE INDEX ON public.bookings (affiliate_id);
