/** Size of the visible window onto the canvas, in CSS pixels. */
export interface Size {
  width: number
  height: number
}

/**
 * Where a scene sits in canvas space. Authored in `content/scenes.json`.
 *
 * The coordinate space is a plain left-handed maths space and is never mirrored
 * for RTL — mirroring the canvas would mirror the Persian type inside it.
 * Journeys read right-to-left by convention: "next" moves in negative X.
 */
export interface ScenePlacement {
  x: number
  y: number
  /** Authored size multiplier. >1 means the camera zooms in to reach it. */
  scale: number
  /** Degrees. Beyond ±8 this reads as a gimmick rather than a flourish. */
  rotate: number
}

/** A node in the scene graph. */
export interface SceneNode {
  id: string
  /** Key into the scene component registry. */
  component: string
  camera: ScenePlacement
  transition: TransitionName
  next?: string
  back?: string
  meta?: { idleReturn?: boolean }
  /** Passed verbatim to the scene component, so one component can serve many scenes. */
  props?: Readonly<Record<string, string | number | boolean>>
}

/** The transform applied to the single canvas element. */
export interface CameraTransform {
  x: number
  y: number
  scale: number
  rotate: number
}

export type TransitionName = "drift" | "glide" | "dive" | "snap" | "rise" | "home"

/** Lifecycle state driving how much of a scene is rendered. */
export type SceneState = "active" | "near" | "far"
