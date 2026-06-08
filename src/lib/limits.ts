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

/**
 * Checks if a specific event is locked (exceeds the user's plan limits).
 * Sorts all active events by creation date and verifies the index.
 */
export function isEventLocked(
  eventId: string,
  allEvents: Pick<Event, 'id' | 'date' | 'active' | 'created_at'>[],
  planId: string
): boolean {
  const plan = (planId as PlanTier) || 'none'
  const limit = plan === 'none' ? 0 : (PLAN_LIMITS[plan] || 0)

  if (limit === Infinity) return false

  // Filter only active events and sort by created_at ascending (oldest first)
  const activeEvents = allEvents
    .filter(isEventActive)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const index = activeEvents.findIndex((e) => e.id === eventId)

  // If not found in active events, it's either archived or doesn't exist.
  // We do not lock archived events (they are read-only anyway).
  if (index === -1) return false

  return index >= limit
}
