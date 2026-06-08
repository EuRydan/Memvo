-- Adiciona a coluna guest_id na tabela media para rastreamento de uso seguro
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS guest_id UUID;

-- Cria um índice para consultas mais rápidas por guest_id, útil para contagem de limites de upload
CREATE INDEX IF NOT EXISTS idx_media_guest_id ON public.media(guest_id);

-- Opcional: Atualiza a RLS de inserção da tabela media para proibir inserts anônimos (já que passaremos a usar uma API no Backend)
-- Para não quebrar eventos antigos em andamento, você pode optar por manter a política atual ou restringir.
-- Como agora temos uma API (/api/media/create), podemos permitir inserts anônimos apenas através da service_role.
-- Descomente as linhas abaixo se quiser FORÇAR o uso da nova API fechando a porta do frontend:
/*
DROP POLICY IF EXISTS "Qualquer um pode inserir media" ON public.media;
CREATE POLICY "Apenas autenticados ou service_role inserem media"
ON public.media FOR INSERT
TO authenticated
WITH CHECK (true);
*/
