/**
 * faq.js — FAQ Accordion
 */
import { $$ } from './utils.js';

export function initFAQ() {
  const items = $$('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const answer  = item.querySelector('.faq-answer');
    if (!trigger || !answer) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // Set ARIA
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', answer.id || '');
    answer.setAttribute('role', 'region');
  });

  // Update aria on open
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'class') {
        const item    = m.target;
        const trigger = item.querySelector('.faq-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      }
    });
  });

  items.forEach(item => observer.observe(item, { attributes: true }));
}
