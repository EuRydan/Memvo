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

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header
        className="sticky top-0 z-[60] flex items-center justify-between px-6 h-16 w-full"
        style={{
          background: 'rgba(250, 250, 250, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="flex items-center">
          <Logo className="h-6 w-auto text-ink" />
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown email={userEmail} name={userName} />
        </div>
      </header>

      {/* ── Page Content ── */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}
