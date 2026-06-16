import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isEventLocked, UserPlanRecord } from '@/lib/limits'

// Helper function to create redirects that preserve Supabase cookies
// Evita que o usuário seja deslogado durante os redirecionamentos do funil
function redirectWithCookies(url: URL | string, supabaseResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url)
  
  // Copiar todos os cookies manipulados pelo supabase (como refresh tokens) para o redirect
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
  })
  
  return redirectResponse
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Renova a sessão se necessário e atualiza os cookies em supabaseResponse
  const { data: { user } } = await supabase.auth.getUser()

  // --- OTIMIZAÇÃO: EARLY RETURNS PARA EVITAR QUERIES NO BANCO ---
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/parceiros/cadastro')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isPricingRoute = pathname.startsWith('/pricing')
  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const isAffiliateDashboard = pathname.startsWith('/parceiros/dashboard')
  
  const isHostProtectedRoute = isDashboardRoute || isPricingRoute || isOnboardingRoute
  const isAnyRelevantRoute = isHostProtectedRoute || isAffiliateDashboard || isAuthRoute

  // Se não estiver tentando acessar nenhuma rota protegida, apenas retorna a resposta
  if (!isAnyRelevantRoute) {
    return supabaseResponse
  }

  // --- VERIFICAÇÃO DE LOGIN ---
  if (!user && (isHostProtectedRoute || isAffiliateDashboard)) {
    return redirectWithCookies(new URL('/login', request.url), supabaseResponse)
  }

  const role = user?.user_metadata?.role || 'host'

  // --- SEPARAÇÃO DE PERFIS (RBAC) ---
  if (user && isAffiliateDashboard && role !== 'affiliate') {
    return redirectWithCookies(new URL('/dashboard', request.url), supabaseResponse)
  }

  if (user && role === 'affiliate' && (isAuthRoute || isHostProtectedRoute)) {
    return redirectWithCookies(new URL('/parceiros/dashboard', request.url), supabaseResponse)
  }

  // --- LÓGICA DE FUNIL E PAYWALL (HOSTS) ---
  if (user && role !== 'affiliate' && (isAuthRoute || isHostProtectedRoute)) {
    
    // Obter planos do usuário LOGADO
    let { data: userPlansData } = await supabase
      .from('user_plans')
      .select('event_id, plan_id')
      .eq('user_id', user.id)
      
    let userPlans = (userPlansData || []) as UserPlanRecord[]
    const hasAnyPlan = userPlans.length > 0

    // Extrair eventId da URL (caso esteja acessando /dashboard/123-abc...)
    const eventIdMatch = pathname.match(/^\/dashboard\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/)
    const targetEventId = eventIdMatch ? eventIdMatch[1] : null

    let eventsData: any[] = []
    
    if (targetEventId) {
       // Acessando um evento específico -> busca os dados dele
       const { data } = await supabase.from('events').select('id, active, status, owner_id').eq('id', targetEventId).single()
       if (data) {
         eventsData = [data]
         // Se o usuário atual não for o dono (ex: colaborador), busca os planos do DONO para validar isEventLocked
         if (data.owner_id !== user.id) {
           const { data: ownerPlansData } = await supabase.from('user_plans').select('event_id, plan_id').eq('user_id', data.owner_id)
           userPlans = (ownerPlansData || []) as UserPlanRecord[]
         }
       }
    } else {
       // Acessando a raiz /dashboard ou onboarding -> pega o evento mais recente
       const { data } = await supabase.from('events').select('id, active, status, owner_id').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(1)
       if (data) eventsData = data
    }

    const hasAnyEvent = eventsData.length > 0
    let targetUrl: string | null = null

    // REGRA 1: Acessou um evento específico (/dashboard/[eventId]) -> VERIFICAÇÃO RIGOROSA!
    if (targetEventId && hasAnyEvent) {
       const event = eventsData[0]
       // Reutilizando exatamente a mesma lógica de negócio do frontend
       const locked = isEventLocked(event.id, userPlans, event)
       
       if (locked) {
         targetUrl = `/pricing?eventId=${event.id}`
       }
    } 
    // REGRA 2: Acesso à Raiz e Fluxo de Onboarding
    else {
      const latestEvent = eventsData[0]
      const latestIsDraftLocked = latestEvent && latestEvent.status === 'draft' && !latestEvent.active && isEventLocked(latestEvent.id, userPlans, latestEvent)

      if (latestIsDraftLocked && !hasAnyPlan) {
        // Primeira vez na plataforma, criou rascunho mas não pagou -> manda pro checkout
        if (!isPricingRoute) targetUrl = `/pricing?eventId=${latestEvent.id}`
      } else if (!hasAnyEvent && targetEventId === null) {
        // Nunca fez evento -> vai pro onboarding criar o primeiro
        if (!isOnboardingRoute) targetUrl = '/onboarding'
      } else {
         // O restante está liberado (vai ver a lista de eventos no dashboard e seus respectivos cadeados lá)
         if (isAuthRoute) targetUrl = '/dashboard'
      }
    }

    // SÓ REDIRECIONA SE NÃO ESTIVER NA ROTA ALVO (evita Loop comparando só o pathname)
    if (targetUrl) {
      const targetPath = targetUrl.split('?')[0]
      if (pathname !== targetPath) {
        return redirectWithCookies(new URL(targetUrl, request.url), supabaseResponse)
      }
    }
  }

  // Resposta final preservando os cookies para as requisições normais
  return supabaseResponse
}

// Next.js 16: a função deve se chamar "proxy" (não "middleware")
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
