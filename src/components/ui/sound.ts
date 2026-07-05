/**
 * @file sound.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Lightweight zero-asset UI audio synthesizer.
 *
 * @description
 * Implements procedural audio sound effects using the browser Web Audio API, generating short exponential decay sine wave tones for interactive UI elements without requiring external audio files.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- MODULE STATE
// Cache audio context across invocations to avoid browser audio hardware limitations
let sharedCtx: AudioContext | null = null;

// ---------- AUDIO SYNTHESIS & PLAYBACK
/**
 * Lightweight, zero-asset UI sound synthesizer using standard Web Audio API.
 * Plays a short, smooth exponential decay sound overlay to enhance micro-interactions.
 */
export function playClickSound(): void {
  try {
    // ---------- AUDIO CONTEXT RESOLUTION (initialize or retrieve singleton web audio context)
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    // ---------- GUARD CLAUSE (verify Web Audio API support)
    if (!AudioContextClass) {
      return;
    }

    if (!sharedCtx) {
      sharedCtx = new AudioContextClass();
    }
    const ctx = sharedCtx;

    // ---------- OSCILLATOR & GAIN SETUP (configure frequency pitch drop and volume decay curves)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Configure pitch envelope starting at high frequency and dropping rapidly
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    // Configure amplitude envelope starting at subtle volume and fading to silence
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    // ---------- GRAPH CONNECTION & EXECUTION (link audio nodes and trigger timed synthesis)
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Suppress audio exceptions in headless test browsers or strict autoplay policies
  }
}
