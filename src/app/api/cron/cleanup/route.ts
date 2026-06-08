import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isEventLocked } from '@/lib/limits'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Verifies it's a Vercel cron request or passing our secret
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && request.headers.get('User-Agent') !== 'vercel-cron') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let filesDeleted = 0
    let eventsArchived = 0
    let eventsHardDeleted = 0

    // ==========================================
    // FASE 1: Reciclagem de 30 dias (Arquivamento)
    // ==========================================
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate30 = thirtyDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD

    const { data: expiredEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, name')
      .lt('date', cutoffDate30)
      .eq('active', true)

    if (eventsError) throw eventsError

    if (expiredEvents && expiredEvents.length > 0) {
      const eventIds = expiredEvents.map(e => e.id)
      
      const { data: medias } = await supabase
        .from('media')
        .select('id, storage_path')
        .in('event_id', eventIds)

      if (medias && medias.length > 0) {
        const paths = medias.map(m => m.storage_path)
        const chunkSize = 100
        for (let i = 0; i < paths.length; i += chunkSize) {
          const chunk = paths.slice(i, i + chunkSize)
          const { error: storageError } = await supabase.storage.from('media').remove(chunk)
          if (!storageError) filesDeleted += chunk.length
        }

        await supabase.from('media').delete().in('id', medias.map(m => m.id))
      }

      const { error: updateError } = await supabase
        .from('events')
        .update({ active: false })
        .in('id', eventIds)

      if (!updateError) eventsArchived = expiredEvents.length
    }

    // ==========================================
    // FASE 2: Expurgo de Rascunhos Não Pagos (48h)
    // ==========================================
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    // Buscar eventos ativos criados há mais de 48h
    const { data: draftEvents } = await supabase
      .from('events')
      .select('id, owner_id, cover_url')
      .lt('created_at', fortyEightHoursAgo)
      .eq('active', true)

    if (draftEvents && draftEvents.length > 0) {
      // Agrupar eventos por owner_id para otimizar queries
      const ownerIds = [...new Set(draftEvents.map(e => e.owner_id))]
      
      for (const ownerId of ownerIds) {
        const ownerEvents = draftEvents.filter(e => e.owner_id === ownerId)
        
        // Obter plano atual do dono
        const { data: planData } = await supabase
          .from('user_plans')
          .select('plan_id')
          .eq('user_id', ownerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          
        const planId = planData?.plan_id || 'none'
        
        // Obter todos os eventos do dono para a checagem do isEventLocked
        const { data: allOwnerEvents } = await supabase
          .from('events')
          .select('id, date, active, created_at')
          .eq('owner_id', ownerId)
          
        if (!allOwnerEvents) continue

        const eventsToDelete = []
        const filesToRemove: string[] = []

        for (const event of ownerEvents) {
          if (isEventLocked(event.id, allOwnerEvents, planId)) {
            eventsToDelete.push(event.id)
            if (event.cover_url) {
              const coverPathMatch = event.cover_url.match(/storage\/v1\/object\/public\/media\/(.*)/)
              if (coverPathMatch && coverPathMatch[1]) {
                filesToRemove.push(coverPathMatch[1])
              }
            }
          }
        }

        if (eventsToDelete.length > 0) {
          // Remover covers do Storage
          if (filesToRemove.length > 0) {
             const { error: coverDelError } = await supabase.storage.from('media').remove(filesToRemove)
             if (!coverDelError) filesDeleted += filesToRemove.length
          }
          
          // Hard Delete dos eventos
          const { error: delError } = await supabase
            .from('events')
            .delete()
            .in('id', eventsToDelete)
            
          if (!delError) eventsHardDeleted += eventsToDelete.length
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      eventsArchived,
      eventsHardDeleted,
      filesDeleted
    })

  } catch (error: any) {
    console.error('Cleanup Error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
