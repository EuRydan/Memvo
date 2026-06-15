import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { WordmarkFooter } from '@/components/WordmarkFooter'

export default function TermsOfUse() {
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
          <Logo className="w-[100px] h-auto" theme="light" />
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 relative z-10 w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Termos de Uso
        </h1>
        
        <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou usar a Memvor, você concorda em ficar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Descrição do Serviço</h2>
            <p>
              A Memvor é uma plataforma para criação de álbuns de fotos colaborativos para eventos. 
              Permitimos que anfitriões criem eventos personalizados e recebam mídias de seus convidados através de um álbum compartilhado via link ou QR Code. O acesso às funcionalidades premium é concedido mediante um <strong>pagamento único por evento</strong>, sem cobranças de assinaturas recorrentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Pagamentos e Reembolsos</h2>
            <p>
              Todos os pagamentos são processados de forma segura através do Mercado Pago. Por se tratar de um pagamento único por evento criado, o usuário tem o direito de solicitar o reembolso em até 7 (sete) dias após a compra, conforme o Código de Defesa do Consumidor, desde que o evento não tenha ocorrido e a plataforma não tenha sido utilizada ativamente para recebimento de fotos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Programa de Parceiros</h2>
            <p>
              Profissionais do setor de eventos (como cerimonialistas, fotógrafos e assessores) podem se cadastrar em nosso Programa de Parceiros. Os parceiros recebem uma comissão de 25% sobre cada plano vendido através de seu link ou cupom exclusivo. Os pagamentos das comissões são realizados através de transferência via PIX, processados automaticamente pela nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Responsabilidades do Usuário</h2>
            <p>
              Você é o único responsável por todas as fotos, vídeos e outros conteúdos enviados à plataforma. 
              Ao usar a Memvor, você concorda em não enviar conteúdo que seja ilegal, difamatório, ameaçador, 
              pornográfico, ou que infrinja direitos autorais ou marcas registradas de terceiros. A Memvor 
              reserva-se o direito de remover conteúdos que violem estas diretrizes sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Limitação de Responsabilidade</h2>
            <p>
              A Memvor é fornecida "como está" e "conforme disponível". Não garantimos que a plataforma será 
              ininterrupta ou livre de erros. Para garantir a viabilidade do sistema, os arquivos armazenados em nossos servidores poderão ser excluídos 30 dias após a data do evento. 
              Recomendamos que os anfitriões baixem as fotos ou ativem a integração de backup em nuvem (como Google Drive). A Memvor não se responsabiliza pela perda definitiva de fotos após este prazo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Modificações dos Termos</h2>
            <p>
              Podemos modificar estes Termos de Uso a qualquer momento. Quaisquer alterações entrarão em vigor 
              imediatamente após a publicação. O uso continuado da plataforma após a modificação constitui sua 
              aceitação dos novos Termos.
            </p>
          </section>
        </div>
      </main>

      <WordmarkFooter brandName="Memvor" />
    </div>
  )
}
