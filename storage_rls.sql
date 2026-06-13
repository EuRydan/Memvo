-- Script SQL para executar no painel do Supabase (SQL Editor)
-- Substitua a política atual de INSERT do bucket 'media' por esta, ou adicione caso não exista restrição.

DROP POLICY IF EXISTS "Limit file size and enforce path" ON storage.objects;

CREATE POLICY "Limit file size and enforce path" ON storage.objects 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  bucket_id = 'media' AND
  (
    -- 1. Regra para Uploads de Mídia dentro do evento (event_id/arquivo.ext)
    (
      (storage.foldername(name))[1] != 'covers' AND
      -- Valida tamanho com base na extensão (50MB vídeo, 10MB imagem)
      (
        CASE 
          WHEN lower(storage.extension(name)) IN ('mp4', 'mov', 'webm') THEN length <= 50000000
          ELSE length <= 10000000
        END
      )
    )
    OR
    -- 2. Regra para Capas de Evento (covers/arquivo.ext)
    (
      (storage.foldername(name))[1] = 'covers' AND 
      length <= 10000000 -- Max 10MB para capas
    )
  )
);
