/**
 * @file setup.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Global test environment initialization and browser API stubs.
 *
 * @description
 * Sets up global stubs for browser APIs not natively implemented in jsdom during test execution, including Web Audio API stubs for UI sound feedback testing and View Transitions API polyfills for smooth navigation testing.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { vi } from 'vitest';

// ---------- WEB AUDIO API MOCKS
class MockAudioContext {
  currentTime = 0;
  destination = {};

  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
}

// ---------- GLOBAL AUDIO STUBS REGISTRATION
vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);

// ---------- VIEW TRANSITIONS API MOCKS
if (typeof document !== 'undefined') {
  document.startViewTransition = (callback: () => void) => {
    callback();
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    } as unknown as ViewTransition;
  };
}
