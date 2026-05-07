-- ================================================================
-- SQL UNICO CONSOLIDADO - ReservaTurismo
-- Cole TUDO no SQL Editor do Supabase e execute de uma vez
-- Totalmente idempotente (pode rodar varias vezes sem erro)
-- ================================================================


-- ==========================================
-- PARTE 1: COLUNAS FALTANTES EM BOOKINGS
-- (colunas que o codigo usa mas nao existem no banco)
-- ==========================================

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tour_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total NUMERIC;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS transfer_group TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coupon_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ;

-- Copiar total_amount para total (para registros existentes)
UPDATE public.bookings SET total = total_amount WHERE total IS NULL AND total_amount IS NOT NULL;


-- ==========================================
-- PARTE 2: COLUNAS NOVAS EM PARTNERS
-- ==========================================

ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS commission_percent NUMERIC;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS name TEXT;


-- ==========================================
-- PARTE 3: COLUNAS DE AFILIADO EM BOOKINGS
-- ==========================================

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.partners(id);


-- ==========================================
-- PARTE 4: COLUNAS DE REFUND EM BOOKINGS
-- ==========================================

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_amount NUMERIC;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT;


-- ==========================================
-- PARTE 5: COLUNAS DE DISPUTA EM BOOKINGS
-- ==========================================

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS dispute_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS dispute_reason TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS dispute_amount NUMERIC;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS dispute_status TEXT;


-- ==========================================
-- PARTE 6: TABELA AFFILIATE_COMMISSIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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


-- ==========================================
-- PARTE 7: TABELA AUDIT_LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- PARTE 8: PROFILES - constraint + default
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'supplier', 'affiliate', 'partner', 'customer'));
  END IF;
END $$;

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';


-- ==========================================
-- PARTE 9: TRIGGER - Auto-criar profile no signup
-- ==========================================

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;


-- ==========================================
-- PARTE 10: TODOS OS INDICES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_bookings_affiliate_id ON bookings(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_date ON bookings(tour_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_product_id ON booking_items(product_id);

CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_partner ON affiliate_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);


-- ==========================================
-- PARTE 11: RLS em TODAS as tabelas
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


-- ==========================================
-- PARTE 12: POLICIES - PROFILES
-- ==========================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;
CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 13: POLICIES - BOOKINGS
-- ==========================================

DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Affiliates can view referred bookings" ON bookings;
CREATE POLICY "Affiliates can view referred bookings"
  ON bookings FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access on bookings" ON bookings;
CREATE POLICY "Service role full access on bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 14: POLICIES - BOOKING_ITEMS
-- ==========================================

DROP POLICY IF EXISTS "Customers can view own booking items" ON booking_items;
CREATE POLICY "Customers can view own booking items"
  ON booking_items FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage booking items" ON booking_items;
CREATE POLICY "Admins can manage booking items"
  ON booking_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on booking_items" ON booking_items;
CREATE POLICY "Service role full access on booking_items"
  ON booking_items FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 15: POLICIES - TRANSACTIONS
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
CREATE POLICY "Admins can manage transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on transactions" ON transactions;
CREATE POLICY "Service role full access on transactions"
  ON transactions FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 16: POLICIES - PARTNERS
-- ==========================================

DROP POLICY IF EXISTS "Partners can view own data" ON partners;
CREATE POLICY "Partners can view own data"
  ON partners FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on partners" ON partners;
CREATE POLICY "Service role full access on partners"
  ON partners FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 17: POLICIES - SUPPLIERS
-- ==========================================

DROP POLICY IF EXISTS "Admins can manage suppliers" ON suppliers;
CREATE POLICY "Admins can manage suppliers"
  ON suppliers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on suppliers" ON suppliers;
CREATE POLICY "Service role full access on suppliers"
  ON suppliers FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 18: POLICIES - CUSTOMERS
-- ==========================================

DROP POLICY IF EXISTS "Customers can view own data" ON customers;
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on customers" ON customers;
CREATE POLICY "Service role full access on customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 19: POLICIES - COUPONS
-- ==========================================

DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on coupons" ON coupons;
CREATE POLICY "Service role full access on coupons"
  ON coupons FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 20: POLICIES - SYSTEM_SETTINGS
-- ==========================================

DROP POLICY IF EXISTS "Public can read non-sensitive settings" ON system_settings;
CREATE POLICY "Public can read non-sensitive settings"
  ON system_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON system_settings;
CREATE POLICY "Admins can update settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on system_settings" ON system_settings;
CREATE POLICY "Service role full access on system_settings"
  ON system_settings FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 21: POLICIES - PRODUCTS
-- ==========================================

DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role full access on products" ON products;
CREATE POLICY "Service role full access on products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 22: POLICIES - AUDIT_LOGS
-- ==========================================

DROP POLICY IF EXISTS "Service role full access on audit_logs" ON audit_logs;
CREATE POLICY "Service role full access on audit_logs"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 23: POLICIES - AFFILIATE_COMMISSIONS
-- ==========================================

DROP POLICY IF EXISTS "Partners can view own commissions" ON affiliate_commissions;
CREATE POLICY "Partners can view own commissions"
  ON affiliate_commissions FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access on affiliate_commissions" ON affiliate_commissions;
CREATE POLICY "Service role full access on affiliate_commissions"
  ON affiliate_commissions FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- PARTE 24: VIEW SEGURA (settings publicos)
-- ==========================================

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
-- PARTE 25: FUNCOES AUXILIARES
-- ==========================================

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

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;


-- ==========================================
-- PRONTO!
-- ==========================================
--
-- Roles: admin, supplier, affiliate, partner, customer
--
-- Promover admin:
--   UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
--
-- Criar afiliado:
--   UPDATE profiles SET role = 'affiliate' WHERE email = 'parceiro@email.com';
--   INSERT INTO partners (name, user_id, commission_percent)
--   VALUES ('Nome', (SELECT id FROM auth.users WHERE email = 'parceiro@email.com'), 10);
--
-- Criar fornecedor:
--   UPDATE profiles SET role = 'supplier' WHERE email = 'fornecedor@email.com';
-- ==========================================
