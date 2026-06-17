-- ================================================================
-- SCRIPT DE INICIALIZAÇÃO COMPLETA - PRATIK TURISMO
-- Rode este script em um projeto Supabase novo para criar
-- toda a infraestrutura da plataforma.
-- ================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CRIAÇÃO DAS TABELAS BASE
-- ==========================================

-- PERFIS (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'supplier', 'affiliate', 'partner', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONFIGURAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT DEFAULT 'Pratik Turismo',
  cnpj TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  stripe_public_key TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_user TEXT,
  smtp_pass TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUTOS (PASSEIOS/TRANSFERS)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  price NUMERIC DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  availability BOOLEAN DEFAULT true,
  capacity_per_slot INTEGER DEFAULT 0,
  is_fixed_time BOOLEAN DEFAULT false,
  important_info TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTROLE DE DISPONIBILIDADE (VAGAS)
CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_slots INTEGER DEFAULT 0,
  used_slots INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, date)
);

-- PARCEIROS E AFILIADOS
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  stripe_account_id TEXT,
  commission_percent NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORNECEDORES
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_info JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTES (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  document TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUPONS DE DESCONTO
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_amount NUMERIC,
  discount_type TEXT DEFAULT 'percentage',
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESERVAS (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  affiliate_id UUID REFERENCES public.partners(id),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  tour_date DATE,
  date TIMESTAMPTZ,
  total NUMERIC DEFAULT 0,
  product_name TEXT,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER DEFAULT 1,
  customer_name TEXT,
  customer_email TEXT,
  payment_intent_id TEXT,
  transfer_group TEXT,
  coupon_id UUID REFERENCES public.coupons(id),
  refund_amount NUMERIC,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  refunded_by UUID REFERENCES auth.users(id),
  payment_failure_reason TEXT,
  dispute_id TEXT,
  dispute_reason TEXT,
  dispute_amount NUMERIC,
  dispute_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ITENS DA RESERVA
CREATE TABLE IF NOT EXISTS public.booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_title TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  date DATE,
  pickup_location TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMISSÕES DE AFILIADOS
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  booking_total NUMERIC NOT NULL DEFAULT 0,
  commission_percent NUMERIC NOT NULL DEFAULT 10,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'reversed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, booking_id)
);

-- LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. TRIGGERS E FUNÇÕES
-- ==========================================

-- Auto-criar profile no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helpers de Autenticação
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- View Segura de Configurações
CREATE OR REPLACE VIEW public.public_settings AS
SELECT
  company_name,
  cnpj,
  contact_email,
  phone,
  address,
  stripe_public_key
FROM system_settings
LIMIT 1;

GRANT SELECT ON public.public_settings TO anon, authenticated;

-- ==========================================
-- 4. ÍNDICES DE PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_bookings_affiliate_id ON bookings(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_date ON bookings(tour_date);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ==========================================
-- 5. SEGURANÇA (RLS - ROW LEVEL SECURITY)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Service role full access on profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Bookings
CREATE POLICY "Customers view own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins full bookings" ON bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Service role full bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');

-- Booking Items
CREATE POLICY "Customers view own booking items" ON booking_items FOR SELECT USING (booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()));
CREATE POLICY "Admins full booking items" ON booking_items FOR ALL USING (public.is_admin());
CREATE POLICY "Service role full booking items" ON booking_items FOR ALL USING (auth.role() = 'service_role');

-- Products & Categories (Public read, Admin write)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin full products" ON products FOR ALL USING (public.is_admin());
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin full categories" ON categories FOR ALL USING (public.is_admin());
CREATE POLICY "Public read availability" ON availability FOR SELECT USING (true);
CREATE POLICY "Admin full availability" ON availability FOR ALL USING (public.is_admin());

-- Settings
CREATE POLICY "Public read settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admin full settings" ON system_settings FOR ALL USING (public.is_admin());

-- Outros Acessos Admin Globais (Simplificado para o script)
CREATE POLICY "Admin all transactions" ON transactions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin all partners" ON partners FOR ALL USING (public.is_admin());
CREATE POLICY "Admin all suppliers" ON suppliers FOR ALL USING (public.is_admin());
CREATE POLICY "Admin all customers" ON customers FOR ALL USING (public.is_admin());
CREATE POLICY "Admin all coupons" ON coupons FOR ALL USING (public.is_admin());

-- INSERIR CONFIGURAÇÃO INICIAL
INSERT INTO public.system_settings (company_name) VALUES ('Pratik Turismo') ON CONFLICT DO NOTHING;

-- FIM DO SCRIPT