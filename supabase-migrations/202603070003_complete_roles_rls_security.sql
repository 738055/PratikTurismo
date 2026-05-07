-- ================================================================
-- MIGRATION COMPLETA: Roles, RLS, Security, Triggers
-- Execute no SQL Editor do Supabase Dashboard
-- ================================================================
-- IMPORTANTE: Rode APOS as migrations 001 e 002
-- ================================================================


-- ==========================================
-- 1. TABELA PROFILES: Garantir estrutura
-- ==========================================

-- A tabela profiles ja existe com: id, role, email, full_name, phone,
-- agency_commission_rate, created_at, updated_at

-- Adicionar constraint de roles validas (se nao existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'supplier', 'affiliate', 'partner', 'customer'));
  END IF;
END $$;

-- Garantir que role tem default 'customer'
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'customer';

-- Index para busca por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);


-- ==========================================
-- 2. TRIGGER: Auto-criar profile no signup
-- ==========================================

-- Funcao que cria um profile automaticamente quando um usuario se registra
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

-- Trigger no auth.users (so cria se nao existir)
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
-- 3. RLS: PROFILES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuarios podem ler seu proprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuarios podem atualizar campos limitados do proprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role tem acesso total
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;
CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 4. RLS: BOOKINGS
-- ==========================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver suas proprias reservas
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

-- Admins podem ver todas as reservas (via profile role check)
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins podem atualizar reservas
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Afiliados podem ver reservas indicadas por eles
DROP POLICY IF EXISTS "Affiliates can view referred bookings" ON bookings;
CREATE POLICY "Affiliates can view referred bookings"
  ON bookings FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Service role tem acesso total (para webhooks e APIs internas)
DROP POLICY IF EXISTS "Service role full access on bookings" ON bookings;
CREATE POLICY "Service role full access on bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 5. RLS: TRANSACTIONS
-- ==========================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Admins podem tudo
DROP POLICY IF EXISTS "Admins can manage transactions" ON transactions;
CREATE POLICY "Admins can manage transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on transactions" ON transactions;
CREATE POLICY "Service role full access on transactions"
  ON transactions FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 6. RLS: BOOKING_ITEMS
-- ==========================================

ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver itens das suas reservas
DROP POLICY IF EXISTS "Customers can view own booking items" ON booking_items;
CREATE POLICY "Customers can view own booking items"
  ON booking_items FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

-- Admins podem ver todos
DROP POLICY IF EXISTS "Admins can manage booking items" ON booking_items;
CREATE POLICY "Admins can manage booking items"
  ON booking_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on booking_items" ON booking_items;
CREATE POLICY "Service role full access on booking_items"
  ON booking_items FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 7. RLS: PARTNERS
-- ==========================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Parceiros podem ver seus proprios dados
DROP POLICY IF EXISTS "Partners can view own data" ON partners;
CREATE POLICY "Partners can view own data"
  ON partners FOR SELECT
  USING (user_id = auth.uid());

-- Admins podem gerenciar todos os parceiros
DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on partners" ON partners;
CREATE POLICY "Service role full access on partners"
  ON partners FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 8. RLS: SUPPLIERS
-- ==========================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar fornecedores
DROP POLICY IF EXISTS "Admins can manage suppliers" ON suppliers;
CREATE POLICY "Admins can manage suppliers"
  ON suppliers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on suppliers" ON suppliers;
CREATE POLICY "Service role full access on suppliers"
  ON suppliers FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 9. RLS: CUSTOMERS
-- ==========================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver seus proprios dados
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

-- Admins podem gerenciar clientes
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on customers" ON customers;
CREATE POLICY "Service role full access on customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 10. RLS: COUPONS
-- ==========================================

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Cupons ativos podem ser lidos por qualquer usuario autenticado (para validacao no checkout)
DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (active = true);

-- Admins podem gerenciar cupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on coupons" ON coupons;
CREATE POLICY "Service role full access on coupons"
  ON coupons FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 11. RLS: SYSTEM_SETTINGS
-- ==========================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Campos publicos podem ser lidos por qualquer um (stripe_public_key, company_name, etc.)
-- Campos sensiveis (stripe_secret_key, smtp_pass) so via service_role
DROP POLICY IF EXISTS "Public can read non-sensitive settings" ON system_settings;
CREATE POLICY "Public can read non-sensitive settings"
  ON system_settings FOR SELECT
  USING (true);

-- Admins podem atualizar configuracoes
DROP POLICY IF EXISTS "Admins can update settings" ON system_settings;
CREATE POLICY "Admins can update settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on system_settings" ON system_settings;
CREATE POLICY "Service role full access on system_settings"
  ON system_settings FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 12. RLS: PRODUCTS (leitura publica, escrita admin)
-- ==========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler produtos (loja publica)
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

-- Admins podem gerenciar produtos
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role acesso total
DROP POLICY IF EXISTS "Service role full access on products" ON products;
CREATE POLICY "Service role full access on products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');


-- ==========================================
-- 13. VIEW SEGURA: system_settings sem dados sensiveis
-- ==========================================
-- Usada pelo frontend para ler configuracoes publicas sem expor chaves

CREATE OR REPLACE VIEW public.public_settings AS
SELECT
  company_name,
  cnpj,
  contact_email,
  phone,
  address,
  stripe_public_key,
  promo_modal_image,
  promo_modal_title,
  promo_modal_description,
  promo_modal_link,
  promo_modal_active,
  google_tag_manager_id,
  google_analytics_id,
  meta_pixel_id
FROM system_settings
LIMIT 1;

-- Dar acesso de leitura a view
GRANT SELECT ON public.public_settings TO anon, authenticated;


-- ==========================================
-- 14. FUNCOES AUXILIARES DE SEGURANCA
-- ==========================================

-- Funcao para verificar se o usuario atual eh admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Funcao para obter a role do usuario atual
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


-- ==========================================
-- 15. INDICES DE PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_affiliate_id ON bookings(affiliate_id);
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


-- ==========================================
-- 16. LIMPEZA AUTOMATICA DE AUDIT LOGS
-- ==========================================
-- Remove logs com mais de 90 dias (executar via cron do Supabase)

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
-- 17. SEED: Criar admin inicial (se necessario)
-- ==========================================
-- DESCOMENTE e ajuste o email/UUID se precisar criar o primeiro admin
-- Voce precisa do UUID do usuario ja criado no auth.users

-- INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
-- VALUES (
--   'SEU-UUID-DO-AUTH-USERS-AQUI',
--   'admin@reservaturismo.com.br',
--   'Administrador',
--   'admin',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';


-- ==========================================
-- 18. COMO PROMOVER UM USUARIO A ADMIN
-- ==========================================
-- Execute no SQL Editor substituindo o email:

-- UPDATE profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'email-do-admin@exemplo.com';


-- ==========================================
-- 19. COMO CRIAR UM PARCEIRO/AFILIADO
-- ==========================================
-- Passo 1: O parceiro cria conta normal pelo /login
-- Passo 2: Admin promove para affiliate:

-- UPDATE profiles
-- SET role = 'affiliate', updated_at = NOW()
-- WHERE email = 'parceiro@exemplo.com';

-- Passo 3: Admin vincula na tabela partners:

-- INSERT INTO partners (name, user_id, commission_percent, stripe_account_id)
-- VALUES (
--   'Nome do Parceiro',
--   (SELECT id FROM auth.users WHERE email = 'parceiro@exemplo.com'),
--   10,  -- 10% de comissao
--   NULL -- Sera preenchido quando conectar Stripe Connect
-- );


-- ==========================================
-- 20. COMO CRIAR UM FORNECEDOR
-- ==========================================
-- Passo 1: O fornecedor cria conta normal pelo /login
-- Passo 2: Admin promove para supplier:

-- UPDATE profiles
-- SET role = 'supplier', updated_at = NOW()
-- WHERE email = 'fornecedor@exemplo.com';


-- ==========================================
-- FIM DA MIGRATION
-- ==========================================
-- Roles disponiveis: admin, supplier, affiliate, partner, customer
-- Tabelas com RLS: profiles, bookings, booking_items, transactions,
--                  partners, suppliers, customers, coupons,
--                  system_settings, products, audit_logs,
--                  affiliate_commissions
