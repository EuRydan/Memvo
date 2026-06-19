import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await request.formData()
    const name = (formData.get('name') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    const message = (formData.get('message') as string)?.trim()
    const pageUrl = (formData.get('page_url') as string)?.trim()
    const screenshot = formData.get('screenshot') as File | null

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
    }

    let screenshotUrl: string | null = null

    if (screenshot && screenshot.size > 0) {
      const ext = screenshot.name.split('.').pop() || 'png'
      const path = `bug-reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const arrayBuffer = await screenshot.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await supabaseAdmin.storage
        .from('media')
        .upload(path, buffer, { contentType: screenshot.type, upsert: false })

      if (!uploadError) {
        screenshotUrl = supabaseAdmin.storage.from('media').getPublicUrl(path).data.publicUrl
      } else {
        console.warn('[BUG REPORT] Erro ao fazer upload do screenshot:', uploadError.message)
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from('bug_reports')
      .insert({
        name,
        email,
        message,
        screenshot_url: screenshotUrl,
        page_url: pageUrl || null,
      })

    if (insertError) {
      console.error('[BUG REPORT] Erro ao salvar no banco:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar relatório.' }, { status: 500 })
    }

    console.log(`[BUG REPORT] Novo relatório de ${name} <${email}> em ${pageUrl}`)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[BUG REPORT] Erro inesperado:', err.message)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
