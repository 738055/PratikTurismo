-- Execute este script no SQL Editor do Supabase Dashboard
-- Adiciona colunas de dados da empresa na tabela system_settings

ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS company_name   TEXT DEFAULT 'Reserva Turismo',
  ADD COLUMN IF NOT EXISTS cnpj           TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone          TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS address        TEXT DEFAULT '';

-- Permite leitura pública apenas dos campos não-sensíveis
-- (Os campos SMTP/Stripe/PIxel ficam protegidos por RLS nas chamadas via service_role)
