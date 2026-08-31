"use client"

import { create } from "zustand"
import type { AudienceId } from "@/content/schema/common"
import { createSessionId } from "@/lib/id"

/** One visitor's interaction with the kiosk. Wiped whole on idle reset. */
export interface KioskSession {
  id: string
  startedAt: number
  audience?: AudienceId
  answers: Record<string, string>
  leadSubmitted: boolean
}

interface SessionStore extends KioskSession {
  setAudience(audience: AudienceId): void
  answer(questionId: string, optionId: string): void
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
    audience: undefined,
    answers: {},
    leadSubmitted: false,
  }
}

export const useSession = create<SessionStore>((set) => ({
  ...freshSession(),
  setAudience: (audience) => set({ audience }),
  answer: (questionId, optionId) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: optionId } })),
  markLeadSubmitted: () => set({ leadSubmitted: true }),
  reset: () => set(freshSession()),
}))
