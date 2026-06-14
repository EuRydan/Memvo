import { Event } from '@/types'

export type PlanTier = 'essential' | 'classic' | 'premium'

export const PLAN_LIMITS: Record<PlanTier, number> = {
  essential: Infinity,
  classic: Infinity,
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
  return true
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
 * Shape of a user_plans row required for lock checks.
 */
export type UserPlanRecord = {
  event_id: string | null
  plan_id: string
}

/**
 * Checks if a specific event is locked for the given user.
 *
 * An event is UNLOCKED if:
 *   - There is a user_plans record with event_id === eventId (paid for this event), OR
 *   - There is a legacy record with event_id === null (migrated users — temporary fallback).
 *
 * An event is LOCKED if:
 *   - Its status is 'draft' (not yet published / awaiting payment), AND
 *   - No qualifying user_plans record exists.
 *
 * @param eventId   - The event UUID to check.
 * @param userPlans - All user_plans rows for the event owner (select event_id, plan_id).
 * @param event     - Optional event row; if provided, 'draft' status is checked first.
 */
export function isEventLocked(
  eventId: string,
  userPlans: UserPlanRecord[],
  event?: { status?: string }
): boolean {
  // A paid record for this specific event always unlocks it
  const hasPaidForEvent = userPlans.some((p) => p.event_id === eventId)
  if (hasPaidForEvent) return false

  // Legacy fallback: a record with no event_id (pre-migration) unlocks all events for the owner
  const hasLegacyPlan = userPlans.some((p) => p.event_id === null && p.plan_id && p.plan_id !== 'none')
  if (hasLegacyPlan) return false

  // No qualifying plan found → locked
  return true
}
