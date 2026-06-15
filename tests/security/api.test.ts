import { describe, it, expect } from 'vitest'
import { POST as checkoutPOST } from '@/app/api/payment-intents/init/route'
import { POST as uploadPOST } from '@/app/api/media/presign/route'

describe('Security API Tests (SAST / DAST Mocked)', () => {
  describe('Zod Validation - Checkout Session', () => {
    it('Should block invalid plan inputs (Mass Assignment / Fuzzing protection)', async () => {
      const request = new Request('http://localhost/api/payment-intents/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'hacked_plan' })
      })

      const response = await checkoutPOST(request)
      expect(response.status).toBe(400)
    })

    it('Should allow valid plan inputs', async () => {
      const request = new Request('http://localhost/api/payment-intents/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'essential' })
      })

      const response = await checkoutPOST(request)
      // Since it requires a valid user, we expect 401 Unauthorized, but NOT 400 validation error
      expect(response.status).not.toBe(400)
    })
  })

  describe('Zod Validation - Drive Upload', () => {
    it('Should block missing eventId', async () => {
      const request = new Request('http://localhost/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: 'test.jpg' })
      })

      const response = await uploadPOST(request)
      expect(response.status).toBe(400)
    })

    it('Should block invalid UUID for eventId (SQLi / NoSQLi protection)', async () => {
      const request = new Request('http://localhost/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: 'drop table events', storagePath: 'test.jpg' })
      })

      const response = await uploadPOST(request)
      expect(response.status).toBe(400)
    })
  })
})
