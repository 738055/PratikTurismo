-- ============================================================
-- SEED DATA - Reserva Turismo (Foz do Iguaçu)
-- Este arquivo popula o banco de dados com informações reais
-- e prontas para uso, otimizadas para o novo design UX/UI.
-- ============================================================

-- 1. GARANTIR TABELAS EXTRAS (Banners e Posts se não existirem)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  button_text TEXT DEFAULT 'Ver Mais',
  link TEXT DEFAULT '/tours/search',
  align TEXT DEFAULT 'left',
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate VARCHAR(20) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drivers_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  languages_spoken TEXT[] DEFAULT '{}',
  type VARCHAR(20) NOT NULL DEFAULT 'driver',
  document_number VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LIMPEZA (Opcional - remova se quiser manter dados existentes)
-- TRUNCATE categories, products, banners, posts CASCADE;

-- 3. CONFIGURAÇÕES DO SISTEMA
INSERT INTO public.system_settings (company_name, cnpj, contact_email, phone, address)
VALUES (
  'Pratik Turismo',
  '34.563.274/0001-00',
  'contato@pratikturismo.com.br',
  '+55 45 99101-7224',
  'Av. Jorge Schimmelpfeng, 800 - Centro, Foz do Iguaçu - PR'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  cnpj = EXCLUDED.cnpj,
  contact_email = EXCLUDED.contact_email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- 4. CATEGORIAS
INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Passeios', 'tours', 'As melhores atrações de Foz do Iguaçu e região.'),
  ('22222222-2222-2222-2222-222222222222', 'Transfers', 'transfers', 'Transporte seguro e pontual para aeroportos e atrativos.'),
  ('33333333-3333-3333-3333-333333333333', 'Ingressos', 'ingressos', 'Garanta sua entrada antecipada nas principais atrações.'),
  ('44444444-4444-4444-4444-444444444444', 'Combos', 'combos', 'Economize comprando pacotes com múltiplos passeios.')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Adicionar colunas extras se faltarem (conforme ContentContext)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Star';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

UPDATE public.categories SET icon = 'Map', "order" = 1 WHERE slug = 'tours';
UPDATE public.categories SET icon = 'Plane', "order" = 2 WHERE slug = 'transfers';
UPDATE public.categories SET icon = 'Zap', "order" = 3 WHERE slug = 'ingressos';
UPDATE public.categories SET icon = 'Trophy', "order" = 4 WHERE slug = 'combos';

-- 5. PRODUTOS (PASSEIOS)
INSERT INTO public.products (title, slug, price, category_id, availability, important_info, metadata)
VALUES 
  (
    'Cataratas do Iguaçu (Lado Brasileiro)',
    'cataratas-brasileiras',
    97.00,
    '11111111-1111-1111-1111-111111111111',
    true,
    'Necessário documento original com foto. Use roupas confortáveis e leve capa de chuva.',
    '{
      "type": "tour",
      "is_free_cancellation": true,
      "features": ["Transporte incluso", "Guia bilíngue", "Ingresso não incluso"],
      "guideLanguages": ["Português", "Espanhol", "Inglês"],
      "tags": ["Mais Vendido", "Imperdível"],
      "itinerary": [
        {"time": "08:00", "description": "Saída do hotel"},
        {"time": "09:00", "description": "Chegada ao Parque Nacional"},
        {"time": "12:00", "description": "Retorno ao hotel"}
      ]
    }'
  ),
  (
    'Macuco Safari - Aventura de Barco',
    'macuco-safari',
    380.00,
    '11111111-1111-1111-1111-111111111111',
    true,
    'Prepare-se para se molhar! Leve uma troca de roupa.',
    '{
      "type": "tour",
      "is_free_cancellation": true,
      "features": ["Emoção garantida", "Fotos profissionais opcionais", "Equipamento de segurança"],
      "guideLanguages": ["Português", "Espanhol"],
      "tags": ["Aventura", "Popular"],
      "itinerary": [
        {"time": "10:30", "description": "Trilha pela selva"},
        {"time": "11:00", "description": "Passeio de barco sob as quedas"}
      ]
    }'
  ),
  (
    'Itaipu Binacional - Panorâmica',
    'itaipu-panoramica',
    58.00,
    '33333333-3333-3333-3333-333333333333',
    true,
    'Agende com antecedência para garantir seu horário.',
    '{
      "type": "ticket",
      "is_free_cancellation": false,
      "features": ["Visão panorâmica da barragem", "Ônibus interno incluso"],
      "guideLanguages": ["Português", "Espanhol", "Inglês"],
      "tags": ["Histórico", "Tecnologia"]
    }'
  ),
  (
    'Transfer Aeroporto IGU p/ Hotel (Foz)',
    'transfer-in-igu',
    80.00,
    '22222222-2222-2222-2222-222222222222',
    true,
    'Informe o número do seu voo no momento da reserva.',
    '{
      "type": "transfer",
      "is_free_cancellation": true,
      "features": ["Recepção no desembarque", "Ar condicionado", "Veículo privativo"],
      "transferDetails": {
        "serviceType": "private",
        "passengerCapacity": 4,
        "luggageCapacity": 4,
        "airportCode": "IGU",
        "city": "Foz do Iguaçu"
      },
      "tags": ["Conforto", "Pontualidade"]
    }'
  )
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  metadata = EXCLUDED.metadata;

-- Atualizar colunas extras de produtos se faltarem
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location TEXT;

UPDATE public.products SET 
  featured = true, 
  rating = 4.9, 
  reviews_count = 1250, 
  duration = '4 horas', 
  location = 'Parque Nacional do Iguaçu',
  images = ARRAY['https://images.unsplash.com/photo-1581403481665-22e697b0a3af?q=80&w=1000&auto=format&fit=crop']
WHERE slug = 'cataratas-brasileiras';

UPDATE public.products SET 
  featured = true, 
  rating = 5.0, 
  reviews_count = 850, 
  duration = '2 horas', 
  location = 'Cataratas do Iguaçu',
  images = ARRAY['https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=1000&auto=format&fit=crop']
WHERE slug = 'macuco-safari';

UPDATE public.products SET 
  featured = true, 
  rating = 4.7, 
  reviews_count = 420, 
  duration = '1.5 horas', 
  location = 'Usina de Itaipu',
  images = ARRAY['https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1000&auto=format&fit=crop']
WHERE slug = 'itaipu-panoramica';

UPDATE public.products SET 
  featured = true, 
  rating = 4.9, 
  reviews_count = 2100, 
  duration = '45 min', 
  location = 'Aeroporto de Foz (IGU)',
  images = ARRAY['https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1000&auto=format&fit=crop']
WHERE slug = 'transfer-in-igu';

-- 6. BANNERS
INSERT INTO public.banners (image_url, title, subtitle, button_text, link, align, display_order)
VALUES 
  (
    'https://images.unsplash.com/photo-1581403481665-22e697b0a3af?q=80&w=2000&auto=format&fit=crop',
    'Explore as Cataratas',
    'A sétima maravilha da natureza espera por você. Reserve agora com desconto.',
    'Ver Promoções',
    '/tours/search?category=tours',
    'left',
    1
  ),
  (
    'https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=2000&auto=format&fit=crop',
    'Aventura no Macuco Safari',
    'Sinta a força das águas em um passeio de barco inesquecível.',
    'Reservar Agora',
    '/tours/macuco-safari',
    'center',
    2
  );

-- 7. BLOG POSTS
INSERT INTO public.posts (title, slug, excerpt, content, cover_image)
VALUES 
  (
    'O que fazer em Foz do Iguaçu com chuva?',
    'foz-do-iguacu-com-chuva',
    'Dicas de passeios que você pode aproveitar mesmo se o tempo não estiver bom.',
    'Mesmo com chuva, Foz do Iguaçu oferece atrações incríveis como a Itaipu Binacional, o Duty Free Shop em Puerto Iguazú e ótimos restaurantes gastronômicos...',
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop'
  ),
  (
    'Guia Definitivo: Lado Brasileiro vs Lado Argentino',
    'cataratas-lado-brasileiro-vs-argentino',
    'Saiba as diferenças e qual escolher (ou por que visitar os dois!).',
    'Visitar as Cataratas é obrigatório, mas qual lado é melhor? O lado brasileiro oferece a visão panorâmica, enquanto o lado argentino coloca você dentro das quedas...',
    'https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=1000&auto=format&fit=crop'
  );

-- 8. VEÍCULOS E MOTORISTAS (Para o sistema de OS)
INSERT INTO public.vehicles (plate, model, capacity)
VALUES 
  ('ABC-1234', 'Toyota Corolla (Sedan)', 4),
  ('XYZ-9876', 'Mercedes-Benz Sprinter (Van)', 15),
  ('PRT-2026', 'Jeep Compass (SUV)', 4)
ON CONFLICT (plate) DO NOTHING;

INSERT INTO public.drivers_guides (name, phone, type, languages_spoken)
VALUES 
  ('João Silva', '+55 45 98888-1111', 'driver', ARRAY['Português', 'Espanhol']),
  ('Maria Oliveira', '+55 45 97777-2222', 'guide', ARRAY['Português', 'Inglês', 'Espanhol']),
  ('Pedro Santos', '+55 45 96666-3333', 'both', ARRAY['Português', 'Alemão'])
ON CONFLICT DO NOTHING;

-- 9. FORNECEDORES
INSERT INTO public.suppliers (name, contact_info)
VALUES 
  ('Parque Nacional do Iguaçu', '{"email": "contato@cataratas.com.br", "phone": "45 3521-4400"}'),
  ('Itaipu Binacional', '{"email": "turismo@itaipu.gov.br", "phone": "45 3520-5222"}')
ON CONFLICT DO NOTHING;

-- FIM DO SEED
