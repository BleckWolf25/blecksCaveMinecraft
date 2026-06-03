export interface ModalProps {
  ariaLabel?: string;
  className?: string;
  onClose?: () => void;
}

/**
 * Modular Reusable Backdrop Modal Overlay Component.
 * Wraps custom modal overlays with consistent transitions, close hooks, backdrop clicks, and focus traps.
 */
export class Modal {
  private dialog: HTMLDialogElement;
  private props: ModalProps;

  constructor(props: ModalProps = {}) {
    this.props = props;
    this.dialog = document.createElement('dialog');
    this.dialog.className = 'search-modal'; // Matches standard styling sheet overlay
    if (props.className) {
      props.className.split(' ').filter(Boolean).forEach(c => this.dialog.classList.add(c));
    }
    if (props.ariaLabel) {
      this.dialog.setAttribute('aria-label', props.ariaLabel);
    }

    // Backdrop click close handler
    this.dialog.addEventListener('click', (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        this.close();
      }
    });

    // Native ESC key handler
    this.dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.close();
    });

    document.body.appendChild(this.dialog);
  }

  public setContent(element: HTMLElement): void {
    this.dialog.innerHTML = '';
    this.dialog.appendChild(element);
  }

  public open(): void {
    if (!this.dialog.open) {
      this.dialog.showModal();
    }
  }

  public close(): void {
    if (this.dialog.open) {
      this.dialog.close();
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  public getElement(): HTMLDialogElement {
    return this.dialog;
  }

  public destroy(): void {
    this.close();
    this.dialog.remove();
  }
}
