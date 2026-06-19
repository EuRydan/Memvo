'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { PartnerDashboardContent } from './PartnerDashboardContent'
import { useTranslation } from '@/contexts/I18nContext'
import { UserDropdown } from '@/components/UserDropdown'

export function PartnerDashboardClient({ 
  affiliate, 
  commissions, 
  totalEarned, 
  pendingAmount, 
  monthCommissions,
  user
}: any) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-canvas transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-hairline px-6 h-16 flex items-center justify-between transition-colors duration-200">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-auto text-ink" />
          <span className="font-semibold text-ink text-sm">{t('dashboard.title')}</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-slate">
          <UserDropdown name={affiliate.name} email={user?.email || ''} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 bg-canvas-warm p-6 rounded-3xl border border-hairline shadow-sm flex items-center justify-between transition-colors duration-200">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate uppercase mb-1">{t('dashboard.discountLink')}</p>
              <p className="text-ink font-mono text-sm sm:text-base font-semibold bg-ink/5 px-3 py-1.5 rounded-md inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap border border-ink/10" title={`memvor.app/r/${affiliate.affiliate_code}`}>
                memvor.app/r/{affiliate.affiliate_code}
              </p>
            </div>
            <PartnerDashboardContent affiliateCode={affiliate.affiliate_code} />
          </div>
          
          <div className="w-full md:w-64 bg-canvas-warm p-6 rounded-3xl border border-hairline shadow-sm transition-colors duration-200">
            <p className="text-[11px] font-bold tracking-wider text-slate uppercase mb-1">{t('dashboard.accountStatus')}</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              <span className="text-ink font-semibold">{t('dashboard.active')}</span>
            </div>
            <p className="text-xs text-slate mt-3 truncate">{t('dashboard.pix')}: {affiliate.pix_key}</p>
          </div>
        </div>

        {/* Financial Summary */}
        <h2 className="text-xl font-bold text-ink mb-6 transition-colors font-serif">{t('dashboard.financialSummary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-canvas-warm p-6 rounded-3xl border border-hairline shadow-sm transition-colors duration-200">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">{t('dashboard.monthCommissions')}</p>
            <p className="text-3xl font-bold text-ink">R$ {monthCommissions.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-canvas-warm p-6 rounded-3xl border border-hairline shadow-sm transition-colors duration-200">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">{t('dashboard.totalEarned')}</p>
            <p className="text-3xl font-bold text-ink">R$ {totalEarned.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="bg-canvas-warm p-6 rounded-3xl border border-hairline shadow-sm transition-colors duration-200">
            <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">{t('dashboard.pendingPayment')}</p>
            <p className="text-3xl font-bold text-[#f97316] dark:text-[#fb923c]">R$ {pendingAmount.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {/* Sales History */}
        <h2 className="text-xl font-bold text-ink mb-6 transition-colors font-serif">{t('dashboard.salesHistory')}</h2>
        <div className="bg-canvas-warm rounded-3xl border border-hairline shadow-sm overflow-hidden transition-colors duration-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink/5 border-b border-hairline text-slate font-semibold">
              <tr>
                <th className="px-6 py-4">{t('dashboard.table.date')}</th>
                <th className="px-6 py-4">{t('dashboard.table.plan')}</th>
                <th className="px-6 py-4">{t('dashboard.table.commission')}</th>
                <th className="px-6 py-4">{t('dashboard.table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {commissions?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate">{t('dashboard.table.empty')}</td>
                </tr>
              ) : (
                commissions?.map((c: any) => (
                  <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-ink/5 transition-colors">
                    <td className="px-6 py-4 text-ink">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 capitalize text-ink">{c.payment_intents?.plan_id || t('dashboard.table.unknown')}</td>
                    <td className="px-6 py-4 font-semibold text-ink">R$ {Number(c.amount).toFixed(2).replace('.', ',')}</td>
                    <td className="px-6 py-4">
                      {c.status === 'paid' ? (
                        <span className="text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">{t('dashboard.table.paid')}</span>
                      ) : (
                        <span className="text-orange-500 dark:text-orange-400 font-medium text-xs bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-full">{t('dashboard.table.pending')}</span>
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
