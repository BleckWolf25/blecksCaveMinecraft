/**
 * @file Button.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Modular reusable interactive button component.
 *
 * @description
 * Generates interactive DOM button elements with customizable visual variants, ARIA accessibility attributes, active state toggles, and optional integrated audio click feedback.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { playClickSound } from './sound.ts';

// ---------- TYPE DEFINITIONS
export interface ButtonProps {
  text?: string;
  html?: string;
  variant?: 'primary' | 'secondary' | 'sidebar' | 'filter' | 'close' | 'icon';
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  ariaLabel?: string;
  soundEffect?: boolean;
}

// ---------- COMPONENT: BUTTON
/**
 * Modular Reusable Button Component.
 * Unified button rendering with support for variants, sound, active state toggles, and hover styles.
 */
export function Button(props: ButtonProps): HTMLButtonElement {
  // ---------- ELEMENT CREATION & CLASS ASSIGNMENT (apply base styles and visual variants)
  const btn = document.createElement('button');
  btn.className = 'ui-btn';

  // Attach variant-specific styling class if a visual style is specified
  if (props.variant) {
    btn.classList.add(`ui-btn-${props.variant}`);
  }

  // Parse and apply optional space-delimited utility classes
  if (props.className) {
    props.className
      .split(' ')
      .filter(Boolean)
      .forEach((c) => btn.classList.add(c));
  }

  // ---------- STATE & ACCESSIBILITY ATTRIBUTES (configure active toggles and aria descriptors)
  // Reflect active selection state in CSS classes and screen reader pressed attributes
  if (props.isActive) {
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    btn.setAttribute('aria-pressed', 'false');
  }

  // Disable button interactivity when requested
  if (props.disabled) {
    btn.disabled = true;
  }

  // Provide explicit screen reader label for icon-only or custom buttons
  if (props.ariaLabel) {
    btn.setAttribute('aria-label', props.ariaLabel);
  }

  // ---------- CONTENT POPULATION (insert raw HTML or escaped text strings)
  // Prioritize raw HTML content over plain text for icon embedding support
  if (props.html) {
    btn.innerHTML = props.html;
  } else if (props.text) {
    btn.textContent = props.text;
  }

  // ---------- EVENT BINDING (attach click listener with sound effect and callback invocation)
  btn.addEventListener('click', (e) => {
    // ---------- GUARD CLAUSE (prevent action on disabled button)
    if (props.disabled) {
      return;
    }

    // Trigger UI audio feedback unless explicitly silenced
    if (props.soundEffect !== false) {
      playClickSound();
    }

    // Execute user-provided click callback
    if (props.onClick) {
      props.onClick(e);
    }
  });

  return btn;
}
