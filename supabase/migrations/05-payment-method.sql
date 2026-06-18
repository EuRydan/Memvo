-- Adiciona coluna payment_method ao payment_intents
-- Necessário: o webhook tenta gravar esse campo mas a coluna não existia,
-- causando falha silenciosa no UPDATE (status ficava em 'pending' para sempre).
ALTER TABLE payment_intents ADD COLUMN IF NOT EXISTS payment_method text;
