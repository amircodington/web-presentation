"use client"

import { create } from "zustand"
import type { AudienceGroup, AudienceId } from "@/content/schema/common"
import { createSessionId } from "@/lib/id"

/** One visitor's interaction with the kiosk. Wiped whole on idle reset. */
export interface KioskSession {
  id: string
  startedAt: number
  /** The world chosen at the gateway. The first and widest decision. */
  group?: AudienceGroup
  audience?: AudienceId
  answers: Record<string, string>
  /**
   * Experience ids the visitor finished, in the order they finished them.
   *
   * Drives both halves of brief §12: the world home marks what is done, and the
   * result gets sharper the more of them there are.
   */
  completed: string[]
  leadSubmitted: boolean
}

interface SessionStore extends KioskSession {
  setGroup(group: AudienceGroup): void
  setAudience(audience: AudienceId): void
  answer(questionId: string, optionId: string): void
  /** Idempotent: replaying an experience must not count it twice. */
  complete(experienceId: string): void
  markLeadSubmitted(): void
  /**
   * Clears everything.
   *
   * Deliberately builds a fresh state object rather than patching fields: a reset
   * that forgets one field leaks one visitor's answers to the next, which is the
   * single worst failure this app can have in public.
   */
  reset(): void
}

function freshSession(): KioskSession {
  return {
    id: createSessionId(),
    startedAt: Date.now(),
    group: undefined,
    audience: undefined,
    answers: {},
    completed: [],
    leadSubmitted: false,
  }
}

export const useSession = create<SessionStore>((set) => ({
  ...freshSession(),
  setGroup: (group) => set({ group }),
  setAudience: (audience) => set({ audience }),
  answer: (questionId, optionId) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),
  complete: (experienceId) =>
    set((state) =>
      state.completed.includes(experienceId)
        ? state
        : { completed: [...state.completed, experienceId] },
    ),
  markLeadSubmitted: () => set({ leadSubmitted: true }),
  reset: () => set(freshSession()),
}))
