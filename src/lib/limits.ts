import { Event } from '@/types'

export type PlanTier = 'essential' | 'classic' | 'premium'

export const PROMO_PLANS = ['brasil_game'] as const

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
 * Returns the maximum number of photos a guest can upload per challenge
 */
export function getPhotoLimit(planId: string): number {
  const plan = planId as PlanTier | 'freemium' | 'brasil_game' | 'none'
  if (plan === 'freemium') return 1
  if (plan === 'brasil_game') return 3
  if (plan === 'essential') return 3
  if (plan === 'classic' || plan === 'premium') return Infinity
  return 0 // none
}

/**
 * Returns the maximum number of challenges an event can have
 */
export function getChallengeLimit(planId: string): number {
  const plan = planId as PlanTier | 'freemium' | 'brasil_game' | 'none'
  if (plan === 'freemium') return 1
  if (plan === 'brasil_game') return 4
  if (plan === 'essential') return 4
  if (plan === 'classic') return 7
  if (plan === 'premium') return Infinity
  return 0
}

/**
 * Returns the maximum duration of a video in seconds
 */
export function getVideoDurationLimit(planId: string): number {
  const plan = planId as PlanTier | 'freemium' | 'brasil_game' | 'none'
  if (plan === 'essential' || plan === 'freemium' || plan === 'none') return 0
  if (plan === 'brasil_game') return 60
  if (plan === 'classic') return 60
  if (plan === 'premium') return 180
  return 0
}

export const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 150 * 1024 * 1024 // 150MB

/**
 * Returns whether the plan allows appearance customization
 */
export function isAppearanceEnabled(planId: string): boolean {
  const plan = planId as PlanTier | 'freemium' | 'none'
  return plan === 'classic' || plan === 'premium'
}

/**
 * Returns whether the plan allows the Slideshow/Telão mode
 */
export function isTelaoEnabled(planId: string): boolean {
  const plan = planId as PlanTier | 'freemium' | 'none'
  return plan === 'premium'
}

/**
 * Shape of a user_plans row required for lock checks.
 */
export type UserPlanRecord = {
  event_id: string
  plan_id: string
}

const PLAN_TIER: Record<string, number> = {
  none: 0,
  freemium: 1,
  brasil_game: 1.5,
  essential: 2,
  classic: 3,
  premium: 4,
}

/**
 * Resolves the effective plan ID for a specific event from all user_plans rows.
 *
 * When a user upgrades, the webhook inserts a NEW row (never updates), so there can be
 * multiple rows for the same event_id. This function always returns the highest-tier plan.
 * Falls back to a legacy row (event_id === null) if no event-specific row exists.
 */
export function resolveEventPlanId(userPlans: UserPlanRecord[], eventId: string): string {
  const eventPlans = userPlans.filter(p => p.event_id === eventId)
  if (eventPlans.length > 0) {
    return eventPlans.reduce((best, p) =>
      (PLAN_TIER[p.plan_id] ?? 0) > (PLAN_TIER[best.plan_id] ?? 0) ? p : best
    , eventPlans[0]).plan_id
  }
  const legacyPlan = userPlans.find(p => p.event_id === null && p.plan_id && p.plan_id !== 'none')
  return legacyPlan?.plan_id || 'none'
}

/**
 * Checks if a specific event is locked for the given user.
 *
 * An event is UNLOCKED if:
 *   - There is a user_plans record with event_id === eventId (paid for this event), OR
 *   - There is a legacy record with event_id === null AND the event is already published
 *     (status === 'published') — i.e. it was activated before today's migration.
 *
 * An event is LOCKED if:
 *   - No qualifying user_plans record exists for this event, AND
 *   - The event is NOT published (e.g. status === 'draft') even if the owner has legacy records.
 *
 * @param eventId   - The event UUID to check.
 * @param userPlans - All user_plans rows for the event owner (select event_id, plan_id).
 * @param eventMeta - Optional event row fields: status. Required to enforce the legacy
 *                    fallback correctly — without it, draft events with legacy plans would
 *                    appear unlocked (bypassing payment).
 */
export function isEventLocked(
  eventId: string,
  userPlans: UserPlanRecord[],
  eventMeta?: { status?: string | null; active?: boolean | null }
): boolean {
  // A paid record for this specific event always unlocks it (new model)
  const hasPaidForEvent = userPlans.some((p) => p.event_id === eventId)
  if (hasPaidForEvent) return false

  // Legacy fallback: a record with no event_id (pre-migration) unlocks ONLY events
  // that are already published — never new draft events created after the migration.
  const hasLegacyPlan = userPlans.some((p) => p.event_id === null && p.plan_id && p.plan_id !== 'none')
  if (hasLegacyPlan && eventMeta?.status === 'published') return false

  // No qualifying plan found → locked
  return true
}
/**
 * Returns the maximum number of collaborators an event can have
 */
export function getCollaboratorLimit(planId: string): { max: number, accessLevel: 'full' | 'challenges_only' | null } {
  const plan = planId as PlanTier | 'freemium' | 'none'
  if (plan === 'premium') return { max: 2, accessLevel: 'full' }
  if (plan === 'classic') return { max: 1, accessLevel: 'challenges_only' }
  return { max: 0, accessLevel: null }
}

export type EventAccessResult = {
  isOwner: boolean
  accessLevel: 'full' | 'challenges_only' | null
}

/**
 * Checks if a user has access to an event (either as owner or accepted collaborator)
 */
export async function hasEventAccess(supabase: any, userId: string, eventId: string): Promise<EventAccessResult> {
  const { data: event } = await supabase.from('events').select('owner_id').eq('id', eventId).single()
  
  if (event && event.owner_id === userId) {
    return { isOwner: true, accessLevel: 'full' }
  }

  const { data: collab } = await supabase.from('event_collaborators')
    .select('access_level')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .maybeSingle()

  if (collab) {
    return { isOwner: false, accessLevel: collab.access_level as 'full' | 'challenges_only' }
  }

  return { isOwner: false, accessLevel: null }
}
