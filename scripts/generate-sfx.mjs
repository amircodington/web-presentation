#!/usr/bin/env node
/**
 * Synthesises the kiosk's sound effects into `public/audio/`.
 *
 * The assets are generated rather than licensed for one reason: AGENTS.md §8
 * requires the kiosk to run with the network cable pulled, and every sound has
 * to be a small file sitting on the machine. Generating them also keeps the
 * family coherent — one synth, one envelope shape, one tuning — which a bag of
 * downloaded clips never is.
 *
 * Committed output, reproducible input. Re-run after editing a voice:
 *
 *   node scripts/generate-sfx.mjs
 *
 * Brief §54 caps an SFX at one second and a celebration at four. The `dur` on
 * every cue below is what enforces that.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const RATE = 44_100
const OUT = "public/audio"

/** Equal temperament, A4 = 440. Notes are written as names for legibility. */
const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, A3: 220, C4: 261.63, E4: 329.63, G4: 392, A4: 440 }

const sine = (f) => (t) => Math.sin(2 * Math.PI * f * t)
const square = (f) => (t) => (Math.sin(2 * Math.PI * f * t) >= 0 ? 0.5 : -0.5)
const noise = () => () => Math.random() * 2 - 1
/** Frequency ramp, for swipes and whooshes. */
const sweep = (from, to) => (t, dur) => Math.sin(2 * Math.PI * (from + ((to - from) * t) / dur) * t)

/** Percussive decay. `k` is how fast it dies; higher is snappier. */
const decay = (k) => (t, dur) => Math.exp(-k * (t / dur))
/** Soft in, soft out — for anything sustained enough that a click would show. */
const swell = (t, dur) => Math.sin(Math.PI * (t / dur)) ** 0.7

function render(dur, layers) {
  const frames = Math.floor(dur * RATE)
  const out = new Float32Array(frames)
  for (const { wave, env, gain = 1, delay = 0 } of layers) {
    const start = Math.floor(delay * RATE)
    for (let i = start; i < frames; i += 1) {
      const t = (i - start) / RATE
      out[i] += wave(t, dur - delay) * env(t, dur - delay) * gain
    }
  }
  return out
}

/** 16-bit mono PCM. Uncompressed on purpose: these decode instantly. */
function wav(samples) {
  const data = Buffer.alloc(samples.length * 2)
  let peak = 0
  for (const s of samples) peak = Math.max(peak, Math.abs(s))
  const norm = peak > 0 ? 0.92 / peak : 0
  samples.forEach((s, i) => data.writeInt16LE(Math.round(s * norm * 32767), i * 2))

  const header = Buffer.alloc(44)
  header.write("RIFF", 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write("WAVEfmt ", 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write("data", 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

/** An arpeggio: one note per step, each struck a little after the last. */
const arp = (notes, step, k = 5) =>
  notes.map((n, i) => ({ wave: sine(n), env: decay(k), gain: 0.8, delay: i * step }))

const CUES = {
  // Shared UI — the quietest things in the product.
  "ui/tap": { dur: 0.09, layers: [{ wave: sine(NOTE.A5), env: decay(24), gain: 0.7 }] },
  "ui/back": { dur: 0.12, layers: [{ wave: sweep(700, 380), env: decay(16), gain: 0.6 }] },
  "ui/whoosh": { dur: 0.42, layers: [{ wave: noise(), env: swell, gain: 0.32 }, { wave: sweep(180, 900), env: swell, gain: 0.18 }] },

  // Kids — brief §51. The loudest world, and the only one with a voice.
  "kids/coin": { dur: 0.34, layers: arp([NOTE.B5, NOTE.E6], 0.06, 7) },
  "kids/pop": { dur: 0.11, layers: [{ wave: sweep(240, 940), env: decay(20), gain: 0.9 }] },
  "kids/boing": { dur: 0.4, layers: [{ wave: (t) => Math.sin(2 * Math.PI * (300 + 120 * Math.sin(24 * t)) * t), env: decay(7), gain: 0.8 }] },
  "kids/sparkle": { dur: 0.5, layers: arp([NOTE.C6, NOTE.E6, NOTE.G6], 0.07, 9) },
  "kids/piggy": { dur: 0.45, layers: [{ wave: sine(NOTE.G4), env: decay(6), gain: 0.7 }, { wave: sine(NOTE.C5), env: decay(8), gain: 0.5, delay: 0.08 }] },
  "kids/bell": { dur: 0.85, layers: [{ wave: sine(NOTE.A5), env: decay(4), gain: 0.8 }, { wave: sine(NOTE.A5 * 2.76), env: decay(9), gain: 0.22 }] },
  "kids/register": { dur: 0.55, layers: [{ wave: noise(), env: decay(40), gain: 0.5 }, { wave: sine(NOTE.C6), env: decay(6), gain: 0.7, delay: 0.05 }, { wave: sine(NOTE.G5), env: decay(6), gain: 0.5, delay: 0.05 }] },
  "kids/oops": { dur: 0.42, layers: [{ wave: sweep(520, 200), env: decay(6), gain: 0.7 }] },
  // Brief §54: a celebration may run to four seconds. This one uses three.
  "kids/celebration": { dur: 3.0, layers: [...arp([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 0.13, 2.2), ...arp([NOTE.E6, NOTE.G6], 0.1, 3).map((l) => ({ ...l, delay: l.delay + 0.6, gain: 0.5 })), { wave: noise(), env: (t, d) => decay(2)(t, d) * 0.35, gain: 0.12, delay: 0.5 }] },

  // Teens — brief §52. Digital rather than toy-like.
  "teens/click": { dur: 0.07, layers: [{ wave: square(NOTE.E6), env: decay(30), gain: 0.45 }] },
  "teens/swipe": { dur: 0.26, layers: [{ wave: noise(), env: decay(11), gain: 0.4 }, { wave: sweep(900, 260), env: decay(9), gain: 0.3 }] },
  "teens/notification": { dur: 0.4, layers: arp([NOTE.E5, NOTE.B5], 0.09, 7) },
  "teens/warning": { dur: 0.5, layers: [{ wave: square(NOTE.A4), env: decay(12), gain: 0.5 }, { wave: square(NOTE.A4), env: decay(12), gain: 0.5, delay: 0.2 }] },
  "teens/tick": { dur: 0.05, layers: [{ wave: sine(NOTE.G6), env: decay(34), gain: 0.35 }] },
  "teens/levelup": { dur: 1.1, layers: arp([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6], 0.1, 3.4) },

  // Adults — brief §53. Restrained; nothing here should carry across a hall.
  "adults/click": { dur: 0.06, layers: [{ wave: sine(NOTE.E5), env: decay(30), gain: 0.32 }] },
  "adults/whoosh": { dur: 0.5, layers: [{ wave: noise(), env: swell, gain: 0.16 }, { wave: sweep(90, 300), env: swell, gain: 0.14 }] },
  "adults/chart": { dur: 0.7, layers: [{ wave: sweep(300, 620), env: swell, gain: 0.3 }] },
  "adults/reveal": { dur: 1.0, layers: [{ wave: sine(NOTE.C4), env: decay(2.4), gain: 0.4 }, { wave: sine(NOTE.G4), env: decay(2.8), gain: 0.28, delay: 0.14 }, { wave: sine(NOTE.E5), env: decay(3.4), gain: 0.2, delay: 0.28 }] },
  "adults/alert": { dur: 0.42, layers: [{ wave: sine(NOTE.A3), env: decay(7), gain: 0.4 }, { wave: sine(NOTE.C4), env: decay(8), gain: 0.24, delay: 0.1 }] },
}

let bytes = 0
for (const [name, { dur, layers }] of Object.entries(CUES)) {
  const file = join(OUT, `${name}.wav`)
  mkdirSync(dirname(file), { recursive: true })
  const buffer = wav(render(dur, layers))
  writeFileSync(file, buffer)
  bytes += buffer.length
}
console.log(`generated ${Object.keys(CUES).length} cues, ${(bytes / 1024).toFixed(0)} KB total`)
