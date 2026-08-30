import type { SceneRegistry } from "@/engine"
import { AttractScene } from "./AttractScene"
import { AudienceScene } from "./AudienceScene"
import { ConnectScene } from "./ConnectScene"
import { CoursesScene } from "./CoursesScene"
import { HomeScene } from "./HomeScene"
import { OfferScene } from "./OfferScene"
import { QuizIntroScene } from "./QuizIntroScene"
import { QuizQuestionScene } from "./QuizQuestionScene"
import { QuizResultScene } from "./QuizResultScene"
import { WorkshopsScene } from "./WorkshopsScene"

/**
 * Maps the `component` field in `scenes.json` to a React component. A scene that
 * names something missing renders a visible error rather than a blank panel.
 */
export const sceneRegistry: SceneRegistry = {
  AttractScene,
  HomeScene,
  AudienceScene,
  CoursesScene,
  WorkshopsScene,
  OfferScene,
  QuizIntroScene,
  QuizQuestionScene,
  QuizResultScene,
  ConnectScene,
}
