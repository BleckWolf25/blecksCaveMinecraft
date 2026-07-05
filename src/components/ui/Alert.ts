/**
 * @file Alert.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Modular reusable alert callout box component.
 *
 * @description
 * Renders unified callout notification boxes with category-specific borders, custom SVG iconography, and themed typography for note, important, warning, and medieval alerts.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- TYPE DEFINITIONS
export type AlertType = 'note' | 'important' | 'warning' | 'medieval' | 'info';

export interface AlertProps {
  type: AlertType;
  title?: string;
  htmlContent: string;
  className?: string;
}

// ---------- COMPONENT: ALERT
/**
 * Modular Reusable Alert Box Component.
 * Unified alert rendering with specific theme borders, icons, and text styles.
 */
export function Alert(props: AlertProps): HTMLElement {
  // ---------- CONTAINER SETUP (apply base callout styling and custom classes)
  const container = document.createElement('div');
  container.className = 'wiki-callout';
  container.classList.add(`${props.type}-alert`);

  // Append optional extra CSS classes passed via component properties
  if (props.className) {
    props.className
      .split(' ')
      .filter(Boolean)
      .forEach((c) => container.classList.add(c));
  }

  // ---------- ICONOGRAPHY & TITLE RESOLUTION (select SVG symbol and default heading based on alert severity)
  let svgIcon = '';
  let defaultTitle = '';

  switch (props.type) {
    case 'note':
    case 'info':
      defaultTitle = 'Note';
      svgIcon =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      break;
    case 'important':
      defaultTitle = 'Important';
      svgIcon =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      break;
    case 'warning':
      defaultTitle = 'Warning';
      svgIcon =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      break;
    case 'medieval':
      defaultTitle = 'Chronicles';
      svgIcon =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>';
      break;
  }

  // ---------- DOM ASSEMBLY (inject formatted heading and HTML content)
  const finalTitle = props.title || defaultTitle;
  container.innerHTML = `
    <h4>${svgIcon} ${finalTitle}</h4>
    <p>${props.htmlContent}</p>
  `;

  return container;
}
