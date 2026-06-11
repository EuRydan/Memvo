import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { AffiliateDashboardContent } from './AffiliateDashboardContent'

export default async function AffiliateDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get affiliate record
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!affiliate) {
    redirect('/')
  }

  if (affiliate.status === 'pending') {
    redirect('/afiliados/aguardando')
  }

  // Get commissions
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select(`
      *,
      payment_intents (
        amount,
        plan_id,
        created_at
      )
    `)
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false })

  const totalEarned = commissions?.filter(c => c.status === 'paid').reduce((acc, c) => acc + Number(c.amount), 0) || 0
  const pendingAmount = commissions?.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.amount), 0) || 0
  const monthCommissions = commissions?.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).reduce((acc, c) => acc + Number(c.amount), 0) || 0

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-auto text-ink" />
          <span className="font-semibold text-ink text-sm">Parceiros</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-slate">
          <span>{affiliate.name}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate uppercase mb-1">Seu Link de Indicação</p>
              <p className="text-ink font-mono text-lg font-semibold bg-stone-50 px-3 py-1 rounded-md inline-block">
                memvo.com.br/r/{affiliate.affiliate_code}
              </p>
            </div>
            <AffiliateDashboardContent affiliateCode={affiliate.affiliate_code} />
          </div>
          
          <div className="w-full md:w-64 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold tracking-wider text-slate uppercase mb-1">Status da Conta</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              <span className="text-ink font-semibold">Ativo</span>
            </div>
            <p className="text-xs text-slate mt-3 truncate">Pix: {affiliate.pix_key}</p>
          </div>
        </div>

        {/* Financial Summary */}
        <h2 className="text-xl font-bold text-ink mb-6" style={{ fontFamily: 'Georgia, serif' }}>Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Comissões do Mês</p>
            <p className="text-3xl font-bold text-ink">R$ {monthCommissions.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Total Ganho</p>
            <p className="text-3xl font-bold text-ink">R$ {totalEarned.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Aguardando Pagamento</p>
            <p className="text-3xl font-bold text-[#f97316]">R$ {pendingAmount.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {/* Sales History */}
        <h2 className="text-xl font-bold text-ink mb-6" style={{ fontFamily: 'Georgia, serif' }}>Histórico de Vendas</h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-gray-100 text-slate font-semibold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Plano Vendido</th>
                <th className="px-6 py-4">Sua Comissão</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate">Nenhuma venda registrada ainda. Comece a compartilhar seu link!</td>
                </tr>
              ) : (
                commissions?.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 capitalize">{c.payment_intents?.plan_id || 'Desconhecido'}</td>
                    <td className="px-6 py-4 font-semibold text-ink">R$ {Number(c.amount).toFixed(2).replace('.', ',')}</td>
                    <td className="px-6 py-4">
                      {c.status === 'paid' ? (
                        <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-full">Pago</span>
                      ) : (
                        <span className="text-orange-500 font-medium text-xs bg-orange-50 px-2 py-1 rounded-full">Aguardando</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
