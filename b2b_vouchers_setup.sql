-- Criação da Tabela de Vouchers (Chaves de Acesso B2B)
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  purchaser_id UUID NOT NULL, -- Pode apontar para auth.users futuramente
  plan_type TEXT NOT NULL, -- ex: 'classic', 'premium'
  status TEXT NOT NULL DEFAULT 'available', -- 'available' ou 'redeemed'
  redeemed_by_event_id UUID, -- Referência para a tabela de eventos (quando existir) ou nulo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Configuração de RLS (Row Level Security)
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança:
-- 1. Qualquer usuário autenticado (noivos) pode ler vouchers (para validação no resgate)
CREATE POLICY "Qualquer usuário pode validar códigos" 
ON vouchers FOR SELECT 
TO authenticated, anon
USING (true);

-- 2. Apenas a Role de Serviço (ou Admin) pode criar novos vouchers
-- Para a API do backend conseguir criar os cupons ao aprovar o pagamento do Asaas
CREATE POLICY "Apenas serviço interno pode criar ou atualizar vouchers" 
ON vouchers FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
