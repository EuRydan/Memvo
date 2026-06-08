import { Event } from '@/types'

export type PlanTier = 'essential' | 'classic' | 'premium'

export const PLAN_LIMITS: Record<PlanTier, number> = {
  essential: 1,
  classic: 3,
  premium: Infinity,
}

/**
 * Checks if an event is currently active (not archived).
 * An event is active if the current date is strictly before or equal to the event date + 30 days.
 * (assuming event.date is YYYY-MM-DD, we use it as midnight UTC or local, here we simplify by parsing it).
 */
export function isEventActive(event: Pick<Event, 'date' | 'active'>): boolean {
  if (event.active === false) return false

  // Event date + 30 days
  const eventDate = new Date(event.date + 'T12:00:00') // use midday to avoid timezone edge cases
  const archiveDate = new Date(eventDate)
  archiveDate.setDate(archiveDate.getDate() + 30)

  return new Date() <= archiveDate
}

/**
 * Returns the number of active events given a list of events.
 */
export function countActiveEvents(events: Pick<Event, 'date' | 'active'>[]): number {
  return events.filter(isEventActive).length
}

/**
 * Checks if a user with a specific plan can create a new event.
 */
export function canCreateEvent(planId: string, events: Pick<Event, 'date' | 'active'>[]): boolean {
  const plan = (planId as PlanTier) || 'essential'
  const limit = PLAN_LIMITS[plan] || 1
  
  if (limit === Infinity) return true
  
  return countActiveEvents(events) < limit
}

/**
 * Returns the maximum number of photos a guest can upload per challenge
 */
export function getPhotoLimit(planId: string): number {
  const plan = planId as PlanTier | 'freemium' | 'none'
  if (plan === 'freemium') return 1
  if (plan === 'essential') return 3
  if (plan === 'classic' || plan === 'premium') return Infinity
  return 0 // none
}
