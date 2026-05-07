-- ============================================================
-- SISTEMA DE ORDENS DE SERVIÇO (OS) — Reserva Turismo
-- SQL COMPLETO E DEFINITIVO — Executar no Supabase SQL Editor
-- Dropa tudo e recria do zero (seguro para re-execução)
-- ============================================================

-- ============================================================
-- LIMPEZA TOTAL (ordem correta por causa das FKs)
-- ============================================================
DROP TABLE IF EXISTS vehicle_driver_links CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS service_order_items CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers_guides CASCADE;

-- Remove políticas RLS órfãs (caso existam de tentativas anteriores)
-- (DROP TABLE CASCADE já cuida disso, mas por segurança)

-- ============================================================
-- 1. VEÍCULOS (sem dependências)
-- ============================================================
CREATE TABLE vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate VARCHAR(20) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'maintenance', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. MOTORISTAS E GUIAS (sem dependências)
-- ============================================================
CREATE TABLE drivers_guides (
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
-- 3. VÍNCULO VEÍCULO ↔ MOTORISTA/GUIA (N:N)
--    Depende de: vehicles, drivers_guides
-- ============================================================
CREATE TABLE vehicle_driver_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers_guides(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, driver_id)
);

-- ============================================================
-- 4. ORDENS DE SERVIÇO — Cabeçalho
--    Depende de: drivers_guides
-- ============================================================
CREATE TABLE service_orders (
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
-- 5. ITENS DA OS — Serviços / Itinerário
--    Depende de: service_orders, vehicles
-- ============================================================
CREATE TABLE service_order_items (
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
-- 6. PASSAGEIROS DETALHADOS
--    Depende de: service_orders
-- ============================================================
CREATE TABLE passengers (
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
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_service_orders_date_in ON service_orders(date_in);
CREATE INDEX idx_service_orders_date_out ON service_orders(date_out);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_guide ON service_orders(assigned_guide_id);
CREATE INDEX idx_service_order_items_so ON service_order_items(service_order_id);
CREATE INDEX idx_service_order_items_date ON service_order_items(date);
CREATE INDEX idx_service_order_items_vehicle ON service_order_items(assigned_vehicle_id);
CREATE INDEX idx_passengers_so ON passengers(service_order_id);
CREATE INDEX idx_vdl_vehicle ON vehicle_driver_links(vehicle_id);
CREATE INDEX idx_vdl_driver ON vehicle_driver_links(driver_id);

-- ============================================================
-- RLS DESABILITADO
-- Tabelas operacionais acessadas apenas pelo admin autenticado.
-- Consistente com as demais tabelas do projeto (suppliers, products, etc.)
-- que usam o cliente anon (@/lib/supabase) sem sessão de auth.
-- ============================================================
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers_guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_driver_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE passengers DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
-- Descomente a linha abaixo para confirmar que todas foram criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('vehicles', 'drivers_guides', 'vehicle_driver_links', 'service_orders', 'service_order_items', 'passengers');
