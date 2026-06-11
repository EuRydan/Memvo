-- Migração para Sistema de Afiliados

-- Tabela de Afiliados
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  profession text,
  pix_key text not null,
  affiliate_code text unique not null,
  status text default 'pending',
  commission_rate numeric default 0.30,
  unique(user_id)
);

-- Tabela de Comissões
create table if not exists affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  affiliate_id uuid references affiliates(id) not null,
  payment_intent_id uuid references payment_intents(id) not null,
  amount numeric not null,
  status text default 'pending',
  paid_at timestamptz,
  unique(payment_intent_id) -- Uma intent só gera comissão 1 vez
);

-- RLS
alter table affiliates enable row level security;
alter table affiliate_commissions enable row level security;

-- Policies para Affiliates
DROP POLICY IF EXISTS "affiliates can insert their own profile" ON affiliates;
create policy "affiliates can insert their own profile"
  on affiliates for insert
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "affiliate sees own data" ON affiliates;
create policy "affiliate sees own data"
  on affiliates for select
  using (auth.uid() = user_id);

-- Policies para Commissions
DROP POLICY IF EXISTS "affiliate sees own commissions" ON affiliate_commissions;
create policy "affiliate sees own commissions"
  on affiliate_commissions for select
  using (
    affiliate_id in (
      select id from affiliates where user_id = auth.uid()
    )
  );

-- Garantir que a Role de Serviço (Webhook/API) possa inserir e alterar
DROP POLICY IF EXISTS "service role can do all to affiliates" ON affiliates;
create policy "service role can do all to affiliates"
  on affiliates for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service role can do all to affiliate_commissions" ON affiliate_commissions;
create policy "service role can do all to affiliate_commissions"
  on affiliate_commissions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
