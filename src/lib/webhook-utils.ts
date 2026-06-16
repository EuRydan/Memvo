export function normalizePaymentMethod(paymentMethodId: string | undefined | null, paymentTypeId: string | undefined | null): string {
  const methodId = paymentMethodId || 'desconhecido'
  const typeId = paymentTypeId || 'desconhecido'
  return methodId === 'pix' ? 'pix' : typeId
}

export function calculateAffiliateCommission(
  paidAmount: number,
  affiliateRate: number | string,
  affiliateUserId: string,
  buyerUserId: string,
  affiliateStatus: string
): { isValid: boolean; amount: number; reason?: string } {
  if (affiliateStatus !== 'approved') {
    return { isValid: false, amount: 0, reason: `Afiliado não está aprovado (status: ${affiliateStatus})` }
  }
  
  if (affiliateUserId === buyerUserId) {
    return { isValid: false, amount: 0, reason: `Tentativa de self-referral bloqueada (user_id: ${buyerUserId})` }
  }

  const amount = paidAmount * Number(affiliateRate)
  return { isValid: true, amount }
}
