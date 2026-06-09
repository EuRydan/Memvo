import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'

const checkoutSchema = z.object({
  plan: z.enum(['essential', 'classic', 'premium']),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD']),
  customer: z.object({
    name: z.string(),
    cpf: z.string(),
    email: z.string().email()
  }),
  card: z.object({
    holderName: z.string(),
    number: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    ccv: z.string()
  }).optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.format() }, { status: 400 })
    }

    const { plan, paymentMethod, customer, card } = parsed.data

    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const prices: Record<string, number> = {
      essential: 79.00,
      classic: 149.00,
      premium: 249.00,
    }

    const priceAmount = prices[plan] || 79.00

    const asaasKey = process.env.ASAAS_API_KEY
    if (!asaasKey) {
      // MOCK SUCCESS when no key is provided (useful for Vercel Previews)
      if (paymentMethod === 'PIX') {
        return NextResponse.json({
          success: true,
          pix: {
            encodedImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            payload: "00020101021226360014br.gov.bcb.pix0114+5511999999999520400005303986540510.005802BR5913Mock Payment6009Sao Paulo62070503***63041D3D"
          }
        })
      }
      return NextResponse.json({
        success: true,
        paymentId: "mock_payment_123"
      })
    }

    // A chave de Sandbox (Homologação) do Asaas sempre contém "hmlg"
    const isSandbox = asaasKey.includes('sandbox') || asaasKey.includes('hmlg') || process.env.NODE_ENV !== 'production'
    
    const baseUrl = isSandbox
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3'

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasKey
    }

    // 1. Criar Cliente
    const customerResponse = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: customer.name,
        cpfCnpj: customer.cpf.replace(/\D/g, ''),
        email: customer.email
      })
    })

    if (!customerResponse.ok) {
      const err = await customerResponse.json()
      console.error('Erro ao criar cliente Asaas', err)
      return NextResponse.json({ error: err.errors?.[0]?.description || 'Erro ao cadastrar cliente' }, { status: 400 })
    }

    const customerData = await customerResponse.json()
    const asaasCustomerId = customerData.id

    // 2. Criar Pagamento
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3) // Vencimento em 3 dias

    const paymentPayload: any = {
      customer: asaasCustomerId,
      billingType: paymentMethod,
      value: priceAmount,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Memvo - Plano ${plan}`,
      externalReference: `${user.id}|${plan}`
    }

    // 2.1 Se for Cartão de Crédito, adicionar informações do cartão
    if (paymentMethod === 'CREDIT_CARD' && card) {
      paymentPayload.creditCard = {
        holderName: card.holderName,
        number: card.number,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear.length === 2 ? `20${card.expiryYear}` : card.expiryYear,
        ccv: card.ccv
      }
      paymentPayload.creditCardHolderInfo = {
        name: customer.name,
        email: customer.email,
        cpfCnpj: customer.cpf.replace(/\D/g, ''),
        postalCode: '01001000', // CEP genérico para transações sem endereço físico (Asaas requer, ou podemos ignorar se não exigido)
        addressNumber: '0',
        addressComplement: 'ND',
        phone: '11999999999' // Asaas exige telefone para transação de cartão, usamos um padrão provisório
      }
    }

    const paymentResponse = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload)
    })

    if (!paymentResponse.ok) {
      const err = await paymentResponse.json()
      console.error('Erro ao processar pagamento', err)
      return NextResponse.json({ error: err.errors?.[0]?.description || 'Erro ao processar pagamento no Asaas' }, { status: 400 })
    }

    const paymentData = await paymentResponse.json()

    // 3. Se for PIX, buscar QR Code e payload copia/cola
    if (paymentMethod === 'PIX') {
      const qrResponse = await fetch(`${baseUrl}/payments/${paymentData.id}/pixQrCode`, {
        headers
      })
      
      if (!qrResponse.ok) {
        return NextResponse.json({ error: 'Erro ao gerar QR Code PIX' }, { status: 400 })
      }
      const qrData = await qrResponse.json()
      
      return NextResponse.json({
        success: true,
        pix: {
          encodedImage: qrData.encodedImage,
          payload: qrData.payload
        }
      })
    }

    // Se for cartão e passou direto, sucesso!
    return NextResponse.json({
      success: true,
      paymentId: paymentData.id
    })

  } catch (error: any) {
    console.error('Erro geral no checkout:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
