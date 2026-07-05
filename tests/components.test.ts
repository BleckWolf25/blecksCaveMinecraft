/**
 * @file components.test.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Unit test suite for modular UI components and filter utilities.
 *
 * @description
 * Verifies the functional behavior, DOM rendering, style class application, keyboard accessibility, and state filtering capabilities of reusable UI components including Button, Card, Alert, Modal, and the portal FilterSystem.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../src/components/ui/Button.ts';
import { Card } from '../src/components/ui/Card.ts';
import { Alert } from '../src/components/ui/Alert.ts';
import { Modal } from '../src/components/ui/Modal.ts';
import { modpacks } from '../src/wiki-data.ts';
import { initFilterSystem } from '../src/utils/filterSystem.ts';

// ---------- TEST SUITE: MODULAR UI COMPONENT SUITE
describe('Modular UI Component Suite', () => {
  // ---------- SUITE: BUTTON COMPONENT
  describe('Button Component', () => {
    it('should render correct text content and base styles', () => {
      const btn = Button({ text: 'Test Button', variant: 'primary' });
      expect(btn.tagName).toBe('BUTTON');
      expect(btn.textContent).toBe('Test Button');
      expect(btn.classList.contains('ui-btn')).toBe(true);
      expect(btn.classList.contains('ui-btn-primary')).toBe(true);
    });

    it('should apply active and disabled states correctly', () => {
      const activeBtn = Button({ text: 'Active', isActive: true });
      expect(activeBtn.classList.contains('active')).toBe(true);
      expect(activeBtn.getAttribute('aria-pressed')).toBe('true');

      const disabledBtn = Button({ text: 'Disabled', disabled: true });
      expect(disabledBtn.disabled).toBe(true);
    });

    it('should fire onClick callback when clicked', () => {
      const callback = vi.fn();
      const btn = Button({ text: 'Click Me', onClick: callback });
      btn.click();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // ---------- SUITE: CARD COMPONENT
  describe('Card Component', () => {
    it('should render modpack specific card elements and details', () => {
      const pack = modpacks['velocita-optimized']!;
      const card = Card({ pack, onClick: vi.fn() });

      expect(card.tagName).toBe('ARTICLE');
      expect(card.classList.contains('modpack-card')).toBe(true);
      expect(card.dataset.packId).toBe('velocita-optimized');
      expect(card.querySelector('.card-title')?.textContent).toBe(pack.title);
      expect(card.style.getPropertyValue('--card-primary')).toBe(pack.colors.primary);
    });

    it('should support featured hero layouts and keyboard bindings', () => {
      const pack = modpacks['aetas-ferrea']!;
      const callback = vi.fn();
      const card = Card({ pack, isFeatured: true, onClick: callback });

      expect(card.classList.contains('featured-hero-card')).toBe(true);
      expect(card.querySelector('.category-badge-portal')).toBeNull();
      expect(card.querySelector('.card-tag')).toBeNull();

      // Simulate enter keypress
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      card.dispatchEvent(event);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should render category badges and type-specific footer tags for different project types', () => {
      const resPack = modpacks['bleck-medical-realism']!;
      const card = Card({ pack: resPack, onClick: vi.fn() });

      expect(card.querySelector('.category-badge-portal')?.textContent).toBe('RESOURCE PACK');
      expect(card.querySelector('.card-tag')?.textContent).toContain('32x');
    });
  });

  // ---------- SUITE: FILTER SYSTEM
  describe('FilterSystem Suite', () => {
    it('should initialize category tabs and filter projects correctly by active tab', () => {
      const container = document.createElement('div');
      const { packMatchesFilters, getActiveTab, filterSection } = initFilterSystem({
        container,
        onFilterChange: vi.fn(),
      });

      expect(getActiveTab()).toBe('all');
      expect(filterSection.querySelector('.portal-category-tabs')).not.toBeNull();

      const resPack = modpacks['bleck-medical-realism']!;
      const modpack = modpacks['velocita-optimized']!;

      expect(packMatchesFilters(resPack)).toBe(true);
      expect(packMatchesFilters(modpack)).toBe(true);

      // Simulate clicking the Resource Pack tab (index 3 in categoryTabs)
      const resTabBtn = filterSection.querySelectorAll<HTMLButtonElement>('.category-tab-btn')[3];
      expect(resTabBtn).toBeDefined();
      resTabBtn!.click();

      expect(getActiveTab()).toBe('resource-pack');
      expect(packMatchesFilters(resPack)).toBe(true);
      expect(packMatchesFilters(modpack)).toBe(false);
    });
  });

  // ---------- SUITE: ALERT COMPONENT
  describe('Alert Component', () => {
    it('should render correct callout layout and SVG configurations', () => {
      const alertEl = Alert({
        type: 'important',
        title: 'Critical Alert',
        htmlContent: 'Something went wrong.',
      });

      expect(alertEl.classList.contains('wiki-callout')).toBe(true);
      expect(alertEl.classList.contains('important-alert')).toBe(true);
      expect(alertEl.querySelector('h4')?.textContent).toContain('Critical Alert');
      expect(alertEl.querySelector('p')?.textContent).toBe('Something went wrong.');
    });
  });

  // ---------- SUITE: MODAL COMPONENT
  describe('Modal Component', () => {
    it('should mount to body and set structured contents', () => {
      const modal = new Modal({ ariaLabel: 'Test Modal' });
      const content = document.createElement('div');
      content.id = 'modal-test-content';
      modal.setContent(content);

      const el = modal.getElement();
      expect(document.body.contains(el)).toBe(true);
      expect(el.querySelector('#modal-test-content')).not.toBeNull();

      modal.destroy();
      expect(document.body.contains(el)).toBe(false);
    });
  });
});
