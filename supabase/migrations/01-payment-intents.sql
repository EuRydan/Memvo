-- Tabela de intenções de pagamento
create table if not exists payment_intents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null,
  event_id uuid references events(id) not null,
  plan_id text not null,
  amount numeric not null,
  status text default 'pending',
  processed_at timestamptz,
  mp_payment_id text unique
);

-- RLS: usuário só vê seus próprios intents
alter table payment_intents enable row level security;

drop policy if exists "owner only on payment_intents" on payment_intents;
create policy "owner only on payment_intents" on payment_intents
  for select using (auth.uid() = user_id);

-- Tabela de rascunhos de onboarding (drafts não persistidos como evento completo)
create table if not exists onboarding_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) not null unique,
  state jsonb not null default '{}'::jsonb
);

-- RLS: usuário gerencia apenas seu draft
alter table onboarding_drafts enable row level security;

drop policy if exists "manage own draft on select" on onboarding_drafts;
create policy "manage own draft on select" on onboarding_drafts
  for select using (auth.uid() = user_id);

drop policy if exists "manage own draft on insert" on onboarding_drafts;
create policy "manage own draft on insert" on onboarding_drafts
  for insert with check (auth.uid() = user_id);

drop policy if exists "manage own draft on update" on onboarding_drafts;
create policy "manage own draft on update" on onboarding_drafts
  for update using (auth.uid() = user_id);

drop policy if exists "manage own draft on delete" on onboarding_drafts;
create policy "manage own draft on delete" on onboarding_drafts
  for delete using (auth.uid() = user_id);

-- Trigger para updated_at no onboarding_drafts
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_onboarding_drafts_modtime on onboarding_drafts;
create trigger update_onboarding_drafts_modtime
before update on onboarding_drafts
for each row execute function update_modified_column();
alter table events add column if not exists status text default 'published';

-- RLS: Permissão para inserir payment_intents
drop policy if exists "insert own payment_intents" on payment_intents;
create policy "insert own payment_intents" on payment_intents
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own payment_intents" on payment_intents;
create policy "update own payment_intents" on payment_intents
  for update using (auth.uid() = user_id);