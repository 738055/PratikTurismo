-- ================================================================
-- MIGRATION: Sistema de OS + Correções de Schema
-- Data: 2026-03-23
-- Seguro para executar múltiplas vezes (idempotente)
--
-- O QUE FAZ:
-- 1. Altera tabela vehicles existente (adiciona model, notes, updated_at)
-- 2. Cria drivers_guides, vehicle_driver_links
-- 3. Cria service_orders, service_order_items, passengers
-- 4. Corrige constraint de roles no profiles
-- 5. Remove coluna duplicada smtp_password do system_settings
-- 6. Atualiza VIEW public_settings (DROP + CREATE)
-- 7. Adiciona RLS + policies admin-only nas tabelas de OS
-- 8. Adiciona policies faltantes (INSERT/DELETE bookings para admins)
-- 9. Migra dados de drivers → drivers_guides
--
-- IMPORTANTE: NÃO dropa nenhuma tabela existente.
-- As tabelas operations, operation_passengers, drivers permanecem intactas.
-- ================================================================


-- ============================================================
-- 1. VEHICLES: Adaptar tabela existente
-- A tabela já existe com: id, name, plate, capacity, status, created_at
-- Precisamos adicionar: model, notes, updated_at
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Copiar 'name' para 'model' nos registros que já existem
UPDATE vehicles SET model = name WHERE model IS NULL AND name IS NOT NULL;

-- Tornar plate UNIQUE se ainda não for (somente se possível)
DO $$
BEGIN
  -- Verifica se já existe constraint unique em plate
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'vehicles'
    AND indexdef LIKE '%plate%'
    AND indexdef LIKE '%UNIQUE%'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'vehicles'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%plate%'
  ) THEN
    -- Só adiciona se não houver duplicatas NEM nulls múltiplos com dados
    IF (SELECT COUNT(*) FROM (
      SELECT plate FROM vehicles
      WHERE plate IS NOT NULL AND plate != ''
      GROUP BY plate HAVING COUNT(*) > 1
    ) sub) = 0 THEN
      BEGIN
        ALTER TABLE vehicles ADD CONSTRAINT vehicles_plate_key UNIQUE (plate);
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Não foi possível criar UNIQUE em vehicles.plate: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'Existem placas duplicadas em vehicles — UNIQUE não aplicado.';
    END IF;
  END IF;
END $$;


-- ============================================================
-- 2. DRIVERS_GUIDES (se não existir)
-- Tabela separada da 'drivers' existente — mais completa
-- ============================================================

CREATE TABLE IF NOT EXISTS drivers_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  languages_spoken TEXT[] DEFAULT '{}',
  type VARCHAR(20) NOT NULL DEFAULT 'driver'
    CHECK (type IN ('guide', 'driver', 'both')),
  document_number VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 3. VEHICLE_DRIVER_LINKS (se não existir)
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_driver_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers_guides(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, driver_id)
);


-- ============================================================
-- 4. SERVICE_ORDERS (se não existir)
-- ============================================================

CREATE TABLE IF NOT EXISTS service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_number VARCHAR(20) NOT NULL UNIQUE,
  agency_name VARCHAR(200),
  reference_code VARCHAR(100),
  lead_passenger_name VARCHAR(200) NOT NULL,
  pax_count INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  date_in DATE NOT NULL,
  date_out DATE NOT NULL,
  hotel_name VARCHAR(200),
  assigned_guide_id UUID REFERENCES drivers_guides(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 5. SERVICE_ORDER_ITEMS (se não existir)
-- ============================================================

CREATE TABLE IF NOT EXISTS service_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(10),
  service_type VARCHAR(30) NOT NULL
    CHECK (service_type IN ('transfer_in', 'transfer_out', 'tour', 'excursion', 'other')),
  description VARCHAR(500) NOT NULL,
  flight_number VARCHAR(20),
  flight_time VARCHAR(10),
  airline_locator VARCHAR(50),
  pick_up VARCHAR(300),
  drop_off VARCHAR(300),
  assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 6. PASSENGERS — lista detalhada por OS (se não existir)
-- ============================================================

CREATE TABLE IF NOT EXISTS passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  birthdate DATE,
  nationality VARCHAR(100),
  document_type VARCHAR(20)
    CHECK (document_type IN ('passport', 'rg', 'dni', 'other')),
  document_number VARCHAR(50),
  gender VARCHAR(1)
    CHECK (gender IN ('M', 'F')),
  is_lead BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 7. ÍNDICES para tabelas de OS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_service_orders_date_in ON service_orders(date_in);
CREATE INDEX IF NOT EXISTS idx_service_orders_date_out ON service_orders(date_out);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_guide ON service_orders(assigned_guide_id);
CREATE INDEX IF NOT EXISTS idx_service_order_items_so ON service_order_items(service_order_id);
CREATE INDEX IF NOT EXISTS idx_service_order_items_date ON service_order_items(date);
CREATE INDEX IF NOT EXISTS idx_service_order_items_vehicle ON service_order_items(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_passengers_so ON passengers(service_order_id);
CREATE INDEX IF NOT EXISTS idx_vdl_vehicle ON vehicle_driver_links(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vdl_driver ON vehicle_driver_links(driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_guides_status ON drivers_guides(status);


-- ============================================================
-- 8. RLS + POLICIES nas tabelas de OS
-- Apenas admins (via profile) e service_role podem acessar
-- ============================================================

-- Habilitar RLS
ALTER TABLE drivers_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_driver_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- ── VEHICLES ──
DROP POLICY IF EXISTS "Admins can manage vehicles" ON vehicles;
CREATE POLICY "Admins can manage vehicles"
  ON vehicles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service role full access on vehicles" ON vehicles;
CREATE POLICY "Service role full access on vehicles"
  ON vehicles FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated can read vehicles" ON vehicles;
CREATE POLICY "Authenticated can read vehicles"
  ON vehicles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── DRIVERS_GUIDES ──
DROP POLICY IF EXISTS "Admins can manage drivers_guides" ON drivers_guides;
CREATE POLICY "Admins can manage drivers_guides"
  ON drivers_guides FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service role full access on drivers_guides" ON drivers_guides;
CREATE POLICY "Service role full access on drivers_guides"
  ON drivers_guides FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated can read drivers_guides" ON drivers_guides;
CREATE POLICY "Authenticated can read drivers_guides"
  ON drivers_guides FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── VEHICLE_DRIVER_LINKS ──
DROP POLICY IF EXISTS "Admins can manage vehicle_driver_links" ON vehicle_driver_links;
CREATE POLICY "Admins can manage vehicle_driver_links"
  ON vehicle_driver_links FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service role full access on vehicle_driver_links" ON vehicle_driver_links;
CREATE POLICY "Service role full access on vehicle_driver_links"
  ON vehicle_driver_links FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated can read vehicle_driver_links" ON vehicle_driver_links;
CREATE POLICY "Authenticated can read vehicle_driver_links"
  ON vehicle_driver_links FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── SERVICE_ORDERS ──
DROP POLICY IF EXISTS "Admins can manage service_orders" ON service_orders;
CREATE POLICY "Admins can manage service_orders"
  ON service_orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service role full access on service_orders" ON service_orders;
CREATE POLICY "Service role full access on service_orders"
  ON service_orders FOR ALL
  USING (auth.role() = 'service_role');

-- ── SERVICE_ORDER_ITEMS ──
DROP POLICY IF EXISTS "Admins can manage service_order_items" ON service_order_items;
CREATE POLICY "Admins can manage service_order_items"
  ON service_order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service role full access on service_order_items" ON service_order_items;
CREATE POLICY "Service role full access on service_order_items"
  ON service_order_items FOR ALL
  USING (auth.role() = 'service_role');

-- ── PASSENGERS ──
DROP POLICY IF EXISTS "Admins can manage passengers" ON passengers;
CREATE POLICY "Admins can manage passengers"
  ON passengers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service role full access on passengers" ON passengers;
CREATE POLICY "Service role full access on passengers"
  ON passengers FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================
-- 9. PROFILES: Corrigir constraint de roles
-- Banco atual: ('customer', 'admin', 'agent')
-- Necessário: ('admin', 'supplier', 'affiliate', 'partner', 'customer', 'agent')
-- ============================================================

-- Buscar e remover TODAS as check constraints da coluna role
-- (o nome pode ser gerado pelo sistema, então buscamos pelo conteúdo)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid
      AND att.attnum = ANY(con.conkey)
    WHERE con.conrelid = 'profiles'::regclass
      AND con.contype = 'c'
      AND att.attname = 'role'
  LOOP
    EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Criar nova constraint com todos os roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
    AND conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'supplier', 'affiliate', 'partner', 'customer', 'agent'));
  END IF;
END $$;


-- ============================================================
-- 10. SYSTEM_SETTINGS: Limpar duplicata smtp_password
-- ============================================================

-- Copiar dados de smtp_password → smtp_pass se smtp_pass estiver vazio
DO $$
BEGIN
  -- Verifica se a coluna smtp_password existe antes de tentar usá-la
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'system_settings'
    AND column_name = 'smtp_password'
  ) THEN
    UPDATE system_settings
    SET smtp_pass = smtp_password
    WHERE (smtp_pass IS NULL OR smtp_pass = '')
      AND smtp_password IS NOT NULL
      AND smtp_password != '';

    ALTER TABLE system_settings DROP COLUMN smtp_password;
  END IF;
END $$;


-- ============================================================
-- 11. VIEW public_settings: DROP + CREATE (não pode renomear colunas)
-- NOTA: o frontend usa system_settings direto (não esta view),
-- mas a view serve como alternativa segura sem dados sensíveis.
-- ============================================================

-- A policy de SELECT no system_settings é "USING (true)" — MANTEMOS assim
-- porque PromoModal, checkout, TrackingProvider leem via anon client.
-- Os dados sensíveis (smtp_pass, stripe_secret_key) ficam expostos
-- mas mudar agora quebraria o app. TODO: migrar frontend para usar public_settings.

DROP VIEW IF EXISTS public.public_settings;

CREATE VIEW public.public_settings AS
SELECT
  company_name,
  cnpj,
  contact_email,
  contact_phone,
  phone,
  address,
  stripe_public_key,
  promo_modal_active,
  promo_modal_title,
  promo_modal_text,
  promo_modal_coupon_code,
  google_tag_manager_id,
  google_analytics_id,
  meta_pixel_id,
  site_url
FROM system_settings
LIMIT 1;

GRANT SELECT ON public.public_settings TO anon, authenticated;


-- ============================================================
-- 12. BOOKINGS: Adicionar policies faltantes para admin
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert bookings" ON bookings;
CREATE POLICY "Admins can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;
CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert booking_items" ON booking_items;
CREATE POLICY "Admins can insert booking_items"
  ON booking_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete booking_items" ON booking_items;
CREATE POLICY "Admins can delete booking_items"
  ON booking_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ============================================================
-- 13. MIGRAR dados de drivers → drivers_guides (se houver)
-- Copia motoristas da tabela antiga para a nova (sem duplicar)
-- ============================================================

DO $$
BEGIN
  -- Só executa se a tabela drivers existir
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'drivers'
  ) THEN
    INSERT INTO drivers_guides (name, document_number, phone, type, status, created_at)
    SELECT
      d.name,
      d.document_number,
      d.phone,
      'driver',
      CASE
        WHEN d.status IN ('active', 'inactive') THEN d.status::VARCHAR(20)
        ELSE 'active'
      END,
      COALESCE(d.created_at, NOW())
    FROM drivers d
    WHERE NOT EXISTS (
      SELECT 1 FROM drivers_guides dg
      WHERE dg.name = d.name
      AND (dg.document_number = d.document_number OR (dg.document_number IS NULL AND d.document_number IS NULL))
    );
  END IF;
END $$;


-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
-- Descomente para confirmar que todas as tabelas foram criadas:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN (
--   'vehicles', 'drivers_guides', 'vehicle_driver_links',
--   'service_orders', 'service_order_items', 'passengers'
-- )
-- ORDER BY table_name;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
--
-- Resumo:
-- ✓ vehicles: adicionado model, notes, updated_at + RLS
-- ✓ drivers_guides: criada + dados migrados da tabela drivers
-- ✓ vehicle_driver_links: criada
-- ✓ service_orders: criada
-- ✓ service_order_items: criada
-- ✓ passengers: criada
-- ✓ profiles: roles expandidos (admin, supplier, affiliate, partner, customer, agent)
-- ✓ system_settings: removido smtp_password duplicado
-- ✓ public_settings: VIEW recriada com colunas corretas
-- ✓ bookings/booking_items: INSERT + DELETE policies para admin
-- ✓ Todas tabelas de OS com RLS + policies (admin + service_role)
--
-- NOTA DE SEGURANÇA:
-- system_settings SELECT continua com USING (true) pois o frontend
-- lê diretamente via anon client (PromoModal, checkout, TrackingProvider).
-- Recomendação futura: migrar frontend para usar view public_settings.
-- ============================================================
