-- ================================================================
-- ADD doc_type column to service_orders
-- Data: 2026-03-23
--
-- Allows distinguishing between document types:
-- 'os' = Ordem de Servico
-- 'agenda' = Agenda do Passageiro
-- 'manifesto' = Manifesto de Fronteira
-- ================================================================

ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS doc_type VARCHAR(20) NOT NULL DEFAULT 'os';

-- Set constraint
ALTER TABLE service_orders
  DROP CONSTRAINT IF EXISTS service_orders_doc_type_check;

ALTER TABLE service_orders
  ADD CONSTRAINT service_orders_doc_type_check
  CHECK (doc_type IN ('os', 'agenda', 'manifesto'));

-- ============================================================
-- FIM
-- ============================================================
