import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PartnerDashboardClient } from './PartnerDashboardClient'

export default async function PartnerDashboardPage() {
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
    redirect('/parceiros/aguardando')
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
    <PartnerDashboardClient 
      affiliate={affiliate}
      commissions={commissions}
      totalEarned={totalEarned}
      pendingAmount={pendingAmount}
      monthCommissions={monthCommissions}
      user={user}
    />
  )
}
