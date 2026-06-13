import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { UserDropdown } from '@/components/UserDropdown'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obter o nome do metadata
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || ''
  const userEmail = user.email || ''

  // Buscar plano atual do usuário
  const { data: planData } = await supabase
    .from('user_plans')
    .select('plan_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const PLAN_NAMES: Record<string, string> = {
    freemium: 'Free',
    essential: 'Essencial',
    classic: 'Clássico',
    premium: 'Premium'
  }
  
  const currentPlan = planData?.plan_id ? (PLAN_NAMES[planData.plan_id] || 'Free') : 'Free'

  return (
    <div className="min-h-screen bg-canvas transition-colors duration-200 flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header
        className="sticky top-0 z-[60] flex items-center justify-between px-6 h-16 w-full bg-canvas/85 backdrop-blur-xl border-b border-hairline transition-colors duration-200"
      >
        <div className="flex items-center">
          <Logo className="h-6 w-auto text-ink transition-colors" />
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown email={userEmail} name={userName} plan={currentPlan} />
        </div>
      </header>

      {/* ── Page Content ── */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}
