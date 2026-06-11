-- Migration 03: Coupons Support

-- Adicionar o affiliate_code ao payment_intents para vincular o cupom na hora da geração do pagamento
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS affiliate_code text;

-- (Opcional) Podemos criar um índice para facilitar a busca de intents por afiliado
CREATE INDEX IF NOT EXISTS idx_payment_intents_affiliate_code ON payment_intents(affiliate_code);
