import { playClickSound } from './sound.ts';

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

/**
 * Modular Reusable Button Component.
 * Unified button rendering with support for variants, sound, active state toggles, and hover styles.
 */
export function Button(props: ButtonProps): HTMLButtonElement {
  const btn = document.createElement('button');

  // Apply base modular classes
  btn.className = 'ui-btn';
  if (props.variant) {
    btn.classList.add(`ui-btn-${props.variant}`);
  }
  if (props.className) {
    props.className.split(' ').filter(Boolean).forEach(c => btn.classList.add(c));
  }

  if (props.isActive) {
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    btn.setAttribute('aria-pressed', 'false');
  }

  if (props.disabled) {
    btn.disabled = true;
  }

  if (props.ariaLabel) {
    btn.setAttribute('aria-label', props.ariaLabel);
  }

  // Set Content
  if (props.html) {
    btn.innerHTML = props.html;
  } else if (props.text) {
    btn.textContent = props.text;
  }

  // Event bindings & sound integration
  btn.addEventListener('click', (e) => {
    if (props.disabled) {return;}

    if (props.soundEffect !== false) {
      playClickSound();
    }

    if (props.onClick) {
      props.onClick(e);
    }
  });

  return btn;
}
