import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { WordmarkFooter } from '@/components/WordmarkFooter'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-50 mix-blend-multiply animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, #f4c5a8 0%, #d4bde8 100%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[40%] h-[50%] rounded-full opacity-40 mix-blend-multiply animate-pulse-slow"
          style={{ background: 'linear-gradient(135deg, #d4bde8 0%, #f4c5a8 100%)', filter: 'blur(100px)' }}
        />
      </div>

      <header className="px-6 py-5 border-b border-gray-200/50 flex items-center relative z-10 bg-white/40 backdrop-blur-xl">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo className="w-[100px] h-auto" />
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 relative z-10 w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Política de Privacidade
        </h1>
        
        <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Coleta de Informações</h2>
            <p>
              Coletamos informações que você nos fornece diretamente ao usar a Memvo, como quando você cria uma conta, 
              faz upload de fotos para um evento ou conecta sua conta do Google Drive. Isso pode incluir seu nome, 
              endereço de e-mail e os arquivos de mídia (fotos e vídeos) que você envia para os álbuns colaborativos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Uso do Google Drive (Integração)</h2>
            <p>
              A Memvo oferece uma integração opcional com o Google Drive para permitir que anfitriões façam backup 
              automático das fotos de seus eventos. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Permissões:</strong> Solicitamos acesso apenas para criar pastas e fazer upload de arquivos que pertencem aos eventos gerenciados por você na Memvo. Não lemos, modificamos ou excluímos arquivos preexistentes no seu Drive pessoal.</li>
              <li><strong>Uso dos Dados:</strong> Os tokens de acesso (OAuth) concedidos são armazenados de forma segura e utilizados estritamente para o processo automatizado de envio das fotos para sua própria conta do Google Drive.</li>
              <li><strong>Retenção:</strong> Após 30 dias da data do evento, os arquivos pesados são deletados dos nossos servidores para preservar o armazenamento, mas permanecem intactos na sua conta do Google Drive se a integração estiver ativa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Compartilhamento de Fotos</h2>
            <p>
              As fotos enviadas para os eventos são armazenadas de forma segura e só podem ser visualizadas por 
              pessoas que possuem o link exclusivo do álbum ou que escanearem o QR Code gerado pelo anfitrião. 
              O anfitrião do evento possui controle sobre o álbum e pode gerenciar ou excluir fotos a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Retenção e Exclusão de Dados</h2>
            <p>
              Nós armazenamos suas informações e os arquivos de mídia pelo tempo necessário para fornecer nossos 
              serviços. Para otimização de infraestrutura, arquivos de mídia de eventos que ocorreram há mais de 
              30 dias poderão ser apagados permanentemente de nossos servidores. Recomendamos fortemente a ativação da 
              integração com o Google Drive para fins de backup. Você também pode solicitar a exclusão total da sua 
              conta entrando em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o uso de seus dados, entre em contato 
              conosco através do painel de suporte na plataforma.
            </p>
          </section>
        </div>
      </main>

      <WordmarkFooter brandName="Memvo" />
    </div>
  )
}
