-- ============================================================
-- Migração: Popular ratings e reviews_count fictícios nos produtos
-- Data: 2026-03-10
-- Descrição: Gera avaliações aleatórias (entre 6.0 e 10.0) e
--            contagem de reviews (entre 8 e 250) para todos os
--            produtos que ainda não possuem rating.
-- ============================================================

UPDATE products
SET
  rating        = ROUND((6.0 + random() * 4.0)::numeric, 1),
  reviews_count = FLOOR(8 + random() * 243)::int
WHERE rating IS NULL;
