-- Add new columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR;
ALTER TABLE events ADD COLUMN IF NOT EXISTS time VARCHAR;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location VARCHAR;
ALTER TABLE events ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Create default_challenges table
CREATE TABLE IF NOT EXISTS default_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 50+ challenges for various event types
INSERT INTO default_challenges (event_type, title) VALUES
-- Casamentos
('Casamento', 'Tire uma foto dos noivos se beijando'),
('Casamento', 'Capture o momento do corte do bolo'),
('Casamento', 'Tire uma foto engraçada de alguém dançando'),
('Casamento', 'Fotografe o vestido da noiva em detalhes'),
('Casamento', 'Tire uma foto de um casal apaixonado (além dos noivos)'),
('Casamento', 'Capture uma criança brincando ou correndo'),
('Casamento', 'Tire uma foto do brinde com os padrinhos'),
('Casamento', 'Grave um vídeo curto de uma mensagem para os noivos'),
('Casamento', 'Fotografe a decoração das mesas'),
('Casamento', 'Tire uma selfie com os noivos (se conseguir!)'),
('Casamento', 'Capture uma emoção sincera de um convidado'),
('Casamento', 'Tire uma foto da entrada dos recém-casados'),
('Casamento', 'Fotografe os docinhos da festa antes de comer'),
('Casamento', 'Grave a primeira dança do casal'),
('Casamento', 'Tire uma foto das alianças (se puder ver de perto)'),
-- Aniversários
('Aniversário', 'Tire uma foto da hora dos parabéns'),
('Aniversário', 'Fotografe o aniversariante abrindo um presente'),
('Aniversário', 'Capture alguém roubando um doce antes da hora'),
('Aniversário', 'Tire uma selfie engraçada com o aniversariante'),
('Aniversário', 'Grave um vídeo da reação do aniversariante com uma surpresa'),
('Aniversário', 'Fotografe o bolo inteiro antes do primeiro pedaço'),
('Aniversário', 'Tire uma foto da pessoa mais velha e da mais nova juntas'),
('Aniversário', 'Capture alguém dando uma gargalhada'),
('Aniversário', 'Tire uma foto em grupo dos melhores amigos'),
('Aniversário', 'Fotografe o momento do brinde ao aniversariante'),
-- Viagem
('Viagem', 'Tire uma foto da vista mais bonita de hoje'),
('Viagem', 'Fotografe um prato de comida típica local'),
('Viagem', 'Capture um momento engraçado de alguém do grupo'),
('Viagem', 'Tire uma selfie no ponto turístico principal'),
('Viagem', 'Grave um vídeo da estrada ou do trajeto'),
('Viagem', 'Fotografe um animal diferente que encontrar'),
('Viagem', 'Tire uma foto pulando com o grupo todo'),
('Viagem', 'Capture o pôr ou nascer do sol'),
('Viagem', 'Fotografe algo muito estranho que você viu'),
('Viagem', 'Tire uma foto da mala mais bagunçada do grupo'),
-- Celebrações (Geral / Outros)
('Celebração', 'Tire uma foto do drink mais bonito da noite'),
('Celebração', 'Fotografe a pista de dança cheia'),
('Celebração', 'Capture o melhor look da festa'),
('Celebração', 'Grave um Boomerang de um brinde coletivo'),
('Celebração', 'Tire uma selfie com 5 pessoas que você não conhecia direito'),
('Celebração', 'Fotografe o anfitrião muito concentrado em algo'),
('Celebração', 'Tire uma foto de uma sobremesa maravilhosa'),
('Celebração', 'Capture um detalhe da decoração que você amou'),
('Celebração', 'Tire uma foto de grupo fazendo careta'),
('Celebração', 'Grave alguém cantando no karaokê (ou junto com a música)'),
-- Extras
('Casamento', 'Fotografe alguém chorando de emoção'),
('Casamento', 'Grave o arremesso do buquê'),
('Aniversário', 'Tire uma foto do aniversariante com as mãos sujas de bolo'),
('Aniversário', 'Fotografe a decoração de balões'),
('Viagem', 'Capture a cara de cansaço depois de uma caminhada longa'),
('Viagem', 'Tire uma foto do meio de transporte que usaram'),
('Celebração', 'Tire uma foto do prato mais servido da noite'),
('Celebração', 'Fotografe alguém quase dormindo no fim da festa'),
('Casamento', 'Grave a chuva de arroz ou pétalas na saída'),
('Aniversário', 'Grave o primeiro pedaço de bolo sendo entregue');

-- RLS Policy for default_challenges (since you enabled RLS)
CREATE POLICY "Permitir leitura publica" ON default_challenges FOR SELECT USING (true);
