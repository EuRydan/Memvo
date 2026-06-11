-- Migration 04: Add source to affiliates

-- Adicionar a coluna source (como a parceira conheceu a Memvo)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS source text;
