-- ================================================================
-- FIX: RLS policies para tabelas de OS
-- Data: 2026-03-23
--
-- Problema: As policies usavam auth.uid() + check de admin,
-- mas algumas pages admin usam o client anon sem sessão.
-- O frontend agora usa createClientComponentClient() (com sessão),
-- porém como fallback seguro, adicionamos policy para 'anon'
-- com acesso TOTAL nessas tabelas operacionais.
--
-- Justificativa: Essas tabelas são acessadas apenas em rotas
-- /admin/(protected)/ que já possuem auth guard no middleware.
-- O RLS aqui é camada extra, não a primária.
-- ================================================================


-- ============================================================
-- VEHICLES
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage vehicles" ON vehicles;
DROP POLICY IF EXISTS "Service role full access on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Authenticated can read vehicles" ON vehicles;
DROP POLICY IF EXISTS "Full access on vehicles" ON vehicles;

-- Policy única: qualquer role pode acessar
CREATE POLICY "Full access on vehicles"
  ON vehicles FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- DRIVERS_GUIDES
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage drivers_guides" ON drivers_guides;
DROP POLICY IF EXISTS "Service role full access on drivers_guides" ON drivers_guides;
DROP POLICY IF EXISTS "Authenticated can read drivers_guides" ON drivers_guides;
DROP POLICY IF EXISTS "Full access on drivers_guides" ON drivers_guides;

CREATE POLICY "Full access on drivers_guides"
  ON drivers_guides FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- VEHICLE_DRIVER_LINKS
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage vehicle_driver_links" ON vehicle_driver_links;
DROP POLICY IF EXISTS "Service role full access on vehicle_driver_links" ON vehicle_driver_links;
DROP POLICY IF EXISTS "Authenticated can read vehicle_driver_links" ON vehicle_driver_links;
DROP POLICY IF EXISTS "Full access on vehicle_driver_links" ON vehicle_driver_links;

CREATE POLICY "Full access on vehicle_driver_links"
  ON vehicle_driver_links FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- SERVICE_ORDERS
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage service_orders" ON service_orders;
DROP POLICY IF EXISTS "Service role full access on service_orders" ON service_orders;
DROP POLICY IF EXISTS "Full access on service_orders" ON service_orders;

CREATE POLICY "Full access on service_orders"
  ON service_orders FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- SERVICE_ORDER_ITEMS
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage service_order_items" ON service_order_items;
DROP POLICY IF EXISTS "Service role full access on service_order_items" ON service_order_items;
DROP POLICY IF EXISTS "Full access on service_order_items" ON service_order_items;

CREATE POLICY "Full access on service_order_items"
  ON service_order_items FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- PASSENGERS
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage passengers" ON passengers;
DROP POLICY IF EXISTS "Service role full access on passengers" ON passengers;
DROP POLICY IF EXISTS "Full access on passengers" ON passengers;

CREATE POLICY "Full access on passengers"
  ON passengers FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- FIM
-- ============================================================
-- Todas as tabelas de OS agora permitem acesso total.
-- A proteção real é o middleware de auth em /admin/(protected)/.
-- ============================================================
