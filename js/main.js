/**
 * main.js — Core initialization: Navbar, Back-to-Top, Mobile Menu, Page Transitions
 */
import { initTheme }        from './theme.js';
import { initHeroSlider }   from './hero-slider.js';
import { initScrollReveal, initCounters, initParallax, initScrollProgress, initUnderlineDraws, initTiltCards } from './animations.js';
import { initForms }        from './forms.js';
import { initFAQ }          from './faq.js';
import { $, $$, throttle }  from './utils.js';

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function initNavbar() {
  const navbar  = $('.navbar');
  const topBar  = $('.top-bar');
  if (!navbar) return;

  const updateHeader = () => {
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // When scrolled past top threshold, slide top-bar up and make navbar compact
    if (scrollY > 15) {
      document.body.classList.add('scrolled-down');
      navbar.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled-down');
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', throttle(updateHeader, 30), { passive: true });
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', updateHeader, { passive: true });
  }
  updateHeader(); // run once on load

  // Mobile hamburger
  const hamburger  = $('.navbar-hamburger');
  const mobileMenu = $('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', open);
    });

    // Close on backdrop click
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) closeMobileMenu();
    });

    // Mobile sub-menus
    $$('.mobile-nav-toggle').forEach(toggle => {
      toggle.addEventListener('click', e => {
        e.preventDefault();
        const sub = toggle.closest('.mobile-nav-item')?.querySelector('.mobile-nav-sub');
        sub?.classList.toggle('open');
        toggle.setAttribute('aria-expanded', sub?.classList.contains('open'));
      });
    });
  }

  function closeMobileMenu() {
    hamburger?.classList.remove('active');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  // Close mobile menu on resize
  window.addEventListener('resize', throttle(() => {
    if (window.innerWidth > 1024) closeMobileMenu();
  }, 200));

  // Active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link[href], .nav-dropdown-link[href], .mobile-nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || href === './' + currentPath)) {
      link.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────
   BACK TO TOP & FLOATING ACTIONS
───────────────────────────────────────────── */
function initBackToTop() {
  const btn = $('.back-to-top');
  const emergencyBtn = $('.emergency-float');
  if (!btn && !emergencyBtn) return;

  const toggle = () => {
    const isScrolled = (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0) > 350;
    if (btn) btn.classList.toggle('visible', isScrolled);
    if (emergencyBtn) emergencyBtn.classList.toggle('shifted', isScrolled);
  };

  window.addEventListener('scroll', throttle(toggle, 40), { passive: true });
  toggle(); // initialize on load

  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ─────────────────────────────────────────────
   PAGE LOADER
───────────────────────────────────────────── */
function initPageLoader() {
  const loader = $('.page-loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 700);
    }, 600);
  });
}

/* ─────────────────────────────────────────────
   SMOOTH PAGE TRANSITIONS
───────────────────────────────────────────── */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    // Only internal links, not anchors or external
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        link.hasAttribute('target')) return;

    e.preventDefault();
    overlay.classList.add('entering');

    setTimeout(() => {
      window.location.href = href;
    }, 500);
  });

  // Fade in on load
  window.addEventListener('pageshow', () => {
    overlay.classList.remove('entering');
    overlay.classList.add('leaving');
    setTimeout(() => overlay.classList.remove('leaving'), 600);
  });
}

/* ─────────────────────────────────────────────
   TESTIMONIAL CAROUSEL (simple auto-scroll)
───────────────────────────────────────────── */
function initTestimonialCarousel() {
  $$('.testimonial-carousel').forEach(carousel => {
    const track   = carousel.querySelector('.testimonial-track');
    const prevBtn = carousel.querySelector('.testimonial-prev');
    const nextBtn = carousel.querySelector('.testimonial-next');
    const cards   = $$('.testimonial-card', track);
    if (!track || !cards.length) return;

    let current = 0;
    const gap   = 24;

    function cardWidth() {
      return cards[0].offsetWidth + gap;
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, cards.length - 1));
      track.style.transform = `translateX(-${current * cardWidth()}px)`;
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Auto-advance
    let timer = setInterval(() => {
      current = (current + 1) % cards.length;
      goTo(current);
    }, 4000);

    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', () => {
      timer = setInterval(() => {
        current = (current + 1) % cards.length;
        goTo(current);
      }, 4000);
    });
  });
}

/* ─────────────────────────────────────────────
   SERVICE FILTER TABS
───────────────────────────────────────────── */
function initFilterTabs() {
  $$('[data-filter-group]').forEach(group => {
    const btns  = $$('[data-filter]', group);
    const items = $$('[data-category]', group.closest('section') || document);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        items.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';
          item.style.opacity = show ? '1' : '0';
        });
      });
    });
  });
}

/* ─────────────────────────────────────────────
   ACTIVE ANCHOR LINKS
───────────────────────────────────────────── */
function initAnchorLinks() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   INIT ALL
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPageLoader();
  initPageTransitions();
  initNavbar();
  initBackToTop();
  initHeroSlider();
  initScrollReveal();
  initCounters();
  initParallax();
  initScrollProgress();
  initUnderlineDraws();
  initTiltCards();
  initForms();
  initFAQ();
  initTestimonialCarousel();
  initFilterTabs();
  initAnchorLinks();
});
