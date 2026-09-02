import type { SceneRegistry } from "@/engine"
import { AttractScene } from "./AttractScene"
import { CollaborationScene } from "./CollaborationScene"
import { ConnectScene } from "./ConnectScene"
import { CourseDetailScene } from "./CourseDetailScene"
import { CourseRevealScene } from "./CourseRevealScene"
import { GameScene } from "./GameScene"
import { GatewayScene } from "./GatewayScene"
import { OfferScene } from "./OfferScene"
import { WorldHomeScene } from "./WorldHomeScene"

/**
 * Maps the `component` field in `scenes.json` to a React component. A scene that
 * names something missing renders a visible error rather than a blank panel.
 */
export const sceneRegistry: SceneRegistry = {
  AttractScene,
  GatewayScene,
  WorldHomeScene,
  CourseDetailScene,
  CourseRevealScene,
  GameScene,
  CollaborationScene,
  OfferScene,
  ConnectScene,
}
