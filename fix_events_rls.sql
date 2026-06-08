-- 1. Remove a política restritiva anterior que impedia a criação de eventos antes da compra
DROP POLICY IF EXISTS "Somente usuários pagantes podem criar eventos" ON public.events;

-- 2. Cria a nova política que permite que QUALQUER usuário logado possa iniciar (draft) do seu evento
-- (Isso garante que o usuário consiga concluir a Etapa 5 do Onboarding e ir para a Etapa 7 de pagamento sem perder dados)
CREATE POLICY "Qualquer usuário logado pode criar eventos" 
ON public.events 
FOR INSERT 
TO authenticated 
WITH CHECK (
    -- O usuário logado deve ser o dono do evento que está sendo criado
    auth.uid() = owner_id 
);
