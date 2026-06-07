-- =========================================================
-- 1. TABELA DE RATE LIMIT (BLOQUEIO DE TENTATIVAS DE VOUCHER)
-- =========================================================

-- Cria a tabela para guardar as tentativas erradas por IP
CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip_address TEXT PRIMARY KEY,
    attempts INT DEFAULT 1,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Permite que a API secreta altere a contagem via service_role
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Ninguém acessa isso pelo front-end, apenas pelo backend (service_role ignora RLS)
-- Então não precisamos criar políticas específicas.


-- =========================================================
-- 2. BLINDAGEM DA TABELA DE EVENTOS (RLS DEFINITIVO)
-- =========================================================

-- Habilitar RLS na tabela de eventos se já não estiver ativado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Removemos políticas de inserção existentes (caso existam, cuidado aqui se o nome for diferente, 
-- mas geralmente a política é "Users can insert their own events" ou algo similar. 
-- Como não sabemos o nome exato da política anterior, vamos forçar uma nova regra de checagem super restrita).

-- CRIA A POLÍTICA DE SEGURANÇA: Só deixa criar um evento novo se o usuário tiver um plano.
-- Nota: Caso já exista uma política de INSERT para 'events', você pode precisar deletá-la no painel do Supabase,
-- indo em Authentication -> Policies -> Events -> Deletar a política de INSERT antiga, para não dar conflito com esta.

CREATE POLICY "Somente usuários pagantes podem criar eventos" 
ON public.events 
FOR INSERT 
TO authenticated 
WITH CHECK (
    -- O usuário deve ser o dono do evento
    auth.uid() = owner_id 
    AND 
    -- O usuário TEM que estar registrado na tabela de user_plans (ou seja, comprou um plano ou usou voucher)
    EXISTS (
        SELECT 1 
        FROM public.user_plans 
        WHERE user_plans.user_id = auth.uid()
    )
);

-- Restaura o direito dos donos lerem/editarem os próprios eventos
-- (Para garantir que a blindagem de criação não quebrou a leitura)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Usuarios podem ver seus proprios eventos'
    ) THEN
        CREATE POLICY "Usuarios podem ver seus proprios eventos"
        ON public.events FOR SELECT TO authenticated
        USING (auth.uid() = owner_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Usuarios podem editar seus proprios eventos'
    ) THEN
        CREATE POLICY "Usuarios podem editar seus proprios eventos"
        ON public.events FOR UPDATE TO authenticated
        USING (auth.uid() = owner_id);
    END IF;
END $$;
