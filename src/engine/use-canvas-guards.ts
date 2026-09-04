"use client"

import { useEffect } from "react"

/**
 * Everything the browser would do with a touch that the kiosk must not let it.
 *
 * The canvas is fixed. A visitor's sleeve, a bag brushing the glass, two children
 * with a hand each on a 55" screen — none of it may move the frame, because a
 * frame moved by accident is one nobody knows how to put back. The only things
 * that move the camera are the tray's controls and the cards inside a scene; the
 * only thing this layer does is stop the browser from panning, zooming or
 * navigating behind their backs.
 *
 * It replaced a gesture layer that offered pinch-zoom, two-finger pan and swipe
 * navigation, with a six-second timer to ease the frame back afterwards. On a
 * standing television that was not exploration, it was drift: a stray touch left
 * the scene off-centre, the timer was too slow to be understood as a correction,
 * and the only reliable way back was pressing «بازگشت» and walking in again.
 *
 * Pointer capture is deliberately never taken here. Capturing a pointer on the
 * viewport retargets its `pointerup`, which swallows the click on whichever card
 * the visitor actually pressed.
 */
export function useCanvasGuards(viewportRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = viewportRef.current
    if (!element) return

    const preventDefault = (event: Event) => event.preventDefault()

    // Safari's own pinch, and the double-tap that zooms a page. `touch-action:
    // none` on the viewport covers the rest, and the document's viewport meta
    // refuses user scaling — all three are needed, one per engine.
    const EVENTS = ["contextmenu", "gesturestart", "gesturechange", "dblclick"] as const
    for (const event of EVENTS) element.addEventListener(event, preventDefault)

    return () => {
      for (const event of EVENTS) element.removeEventListener(event, preventDefault)
    }
  }, [viewportRef])
}
