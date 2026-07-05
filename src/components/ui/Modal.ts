/**
 * @file Modal.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Modular reusable backdrop modal dialog component.
 *
 * @description
 * Encapsulates native HTMLDialogElement behavior to provide accessible modal overlays with consistent show/close animations, backdrop click dismissal, Escape key handling, and DOM lifecycle cleanup.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- TYPE DEFINITIONS
export interface ModalProps {
  ariaLabel?: string;
  className?: string;
  onClose?: () => void;
}

// ---------- CLASS: MODAL
/**
 * Modular Reusable Backdrop Modal Overlay Component.
 * Wraps custom modal overlays with consistent transitions, close hooks, backdrop clicks, and focus traps.
 */
export class Modal {
  // ---------- STATE VARIABLES
  private dialog: HTMLDialogElement;
  private props: ModalProps;

  // ---------- INITIALIZATION & EVENT BINDING
  constructor(props: ModalProps = {}) {
    this.props = props;
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'search-modal';

    // Apply custom styling class names if provided in component configuration
    if (props.className) {
      props.className
        .split(' ')
        .filter(Boolean)
        .forEach((c) => this.dialog.classList.add(c));
    }
    if (props.ariaLabel) {
      this.dialog.setAttribute('aria-label', props.ariaLabel);
    }

    // ---------- BACKDROP CLICK LISTENER (dismiss dialog when clicking outside boundary)
    this.dialog.addEventListener('click', (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        this.close();
      }
    });

    // ---------- ESCAPE KEY LISTENER (intercept native cancel event to run close callback)
    this.dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.close();
    });

    document.body.appendChild(this.dialog);
  }

  // ---------- DOM REFERENCE RETRIEVAL
  public getElement(): HTMLDialogElement {
    return this.dialog;
  }

  // ---------- CONTENT MOUNTING
  public setContent(element: HTMLElement): void {
    this.dialog.innerHTML = '';
    this.dialog.appendChild(element);
  }

  // ---------- DIALOG OPENING
  public open(): void {
    // ---------- GUARD CLAUSE (prevent duplicate showModal invocation)
    if (this.dialog.open) {
      return;
    }
    this.dialog.showModal();
  }

  // ---------- DIALOG DISMISSAL
  public close(): void {
    // ---------- GUARD CLAUSE (ignore close request if already closed)
    if (!this.dialog.open) {
      return;
    }
    this.dialog.close();
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  // ---------- COMPONENT TEARDOWN
  public destroy(): void {
    this.close();
    this.dialog.remove();
  }
}
