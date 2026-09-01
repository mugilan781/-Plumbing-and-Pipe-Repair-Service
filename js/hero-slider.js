/**
 * hero-slider.js — Auto-playing hero slider with keyboard & swipe support
 */
import { $$, addEvent } from './utils.js';

export function initHeroSlider() {
  const sliders = $$('.hero-slider');
  sliders.forEach(initSlider);
}

function initSlider(slider) {
  const slides   = $$('.hero-slide', slider);
  const dots     = $$('.hero-slider-dot', slider);
  const prevBtn  = slider.querySelector('.hero-slider-prev');
  const nextBtn  = slider.querySelector('.hero-slider-next');

  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  let touchSX  = 0;
  let isAnimating = false;

  const DURATION = 5500;

  function goTo(idx, dir = 1) {
    if (isAnimating || idx === current) return;
    isAnimating = true;

    const prev = current;
    current = (idx + slides.length) % slides.length;

    slides[prev].classList.remove('active');
    slides[prev].classList.add('prev');
    slides[current].classList.add('active');

    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    setTimeout(() => {
      slides[prev].classList.remove('prev');
      isAnimating = false;
    }, 1000);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1, -1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, DURATION);
  }

  function resetTimer() {
    startTimer();
  }

  // Init first slide
  slides[0]?.classList.add('active');
  dots[0]?.classList.add('active');
  startTimer();

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
  });

  // Arrow clicks
  prevBtn?.addEventListener('click', () => { prev(); resetTimer(); });
  nextBtn?.addEventListener('click', () => { next(); resetTimer(); });

  // Keyboard navigation
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetTimer(); }
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
  });

  // Touch / swipe
  slider.addEventListener('touchstart', e => {
    touchSX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchSX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
      resetTimer();
    }
  }, { passive: true });

  // Pause on hover
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', startTimer);
}
