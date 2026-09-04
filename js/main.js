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
   HYDRO WATER WAVE PAGE TRANSITIONS
───────────────────────────────────────────── */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Dynamically inject the layered water waves & central hydro beacon
  if (!overlay.querySelector('.water-wave-wrap')) {
    overlay.innerHTML = `
      <div class="water-wave-wrap">
        <div class="water-wave-layer wave-layer-back">
          <svg class="water-wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,176C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div class="water-wave-body"></div>
        </div>
        <div class="water-wave-layer wave-layer-mid">
          <svg class="water-wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,96L48,122.7C96,149,192,203,288,208C384,213,480,171,576,144C672,117,768,107,864,128C960,149,1056,203,1152,208C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div class="water-wave-body"></div>
        </div>
        <div class="water-wave-layer wave-layer-front">
          <svg class="water-wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,192C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <div class="water-wave-body"></div>
        </div>
      </div>
      <div class="water-flow-center">
        <div class="water-droplet-pod">
          <svg class="icon icon-xl" aria-hidden="true"><use href="icons.svg#ic-droplet"></use></svg>
          <div class="water-ripple-ring ring-1"></div>
          <div class="water-ripple-ring ring-2"></div>
        </div>
      </div>
    `;
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    // Only internal page links, not anchors, mailto, tel, or external
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        href.startsWith('javascript:') ||
        link.hasAttribute('target')) return;

    // Don't trigger if already on the same page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const targetPath  = href.split('/').pop() || 'index.html';
    if (currentPath === targetPath && !href.includes('#')) return;

    e.preventDefault();
    overlay.classList.remove('leaving');
    overlay.classList.add('entering');

    setTimeout(() => {
      window.location.href = href;
    }, 480);
  });

  // Smooth wave flow out on page reveal
  window.addEventListener('pageshow', () => {
    overlay.classList.remove('entering');
    overlay.classList.add('leaving');
    setTimeout(() => {
      overlay.classList.remove('leaving');
    }, 550);
  });
}

/* ─────────────────────────────────────────────
   TESTIMONIAL CAROUSEL — proper viewport, no clipping, dots + responsive
───────────────────────────────────────────── */
function initTestimonialCarousel() {
  $$('.testimonial-carousel').forEach(carousel => {
    const viewport = carousel.querySelector('.testimonial-viewport') || carousel;
    const track    = carousel.querySelector('.testimonial-track');
    const prevBtn  = carousel.querySelector('.testimonial-prev');
    const nextBtn  = carousel.querySelector('.testimonial-next');
    const dotsWrap = carousel.querySelector('.testimonial-dots');
    const cards    = $$('.testimonial-card', track);
    if (!track || !cards.length) return;

    let current = 0;
    const gap = 24;

    function getVisibleCount() {
      const vw = viewport.getBoundingClientRect().width;
      if (vw < 768) return 1;
      if (vw < 1024) return Math.min(2, cards.length);
      return Math.min(3, cards.length);
    }
    function getCardStep() {
      const w = cards[0].getBoundingClientRect().width;
      return w + gap;
    }
    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }
    function createDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const pages = getMaxIndex() + 1;
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === current ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Go to testimonial group ' + (i + 1));
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }
    function updateDots() {
      if (!dotsWrap) return;
      $$('.testimonial-dot', dotsWrap).forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }
    function updateButtons() {
      // Infinite loop — arrows always enabled with full contrast
      if (prevBtn) {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = '';
      }
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = '';
      }
    }
    function goTo(idx) {
      const max = getMaxIndex();
      // Infinite loop: wrap around
      if (idx < 0) current = max;
      else if (idx > max) current = 0;
      else current = idx;
      const step = getCardStep();
      const isRtl = document.documentElement.dir === 'rtl';
      const offset = current * step;
      track.style.transform = 'translateX(' + (isRtl ? offset : -offset) + 'px)';
      updateDots();
      updateButtons();
    }

    createDots();
    goTo(0);

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    let timer = setInterval(() => goTo(current + 1), 4500);

    const pause = () => clearInterval(timer);
    const resume = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 4500);
    };
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('focusout', resume);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        createDots();
        goTo(Math.min(current, getMaxIndex()));
      }, 150);
    });

    // Touch swipe
    let startX = 0, isDragging = false;
    viewport.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = true;
      pause();
    }, { passive: true });
    viewport.addEventListener('touchend', e => {
      if (!isDragging) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) goTo(current + 1);
        else goTo(current - 1);
      }
      isDragging = false;
      resume();
    }, { passive: true });
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
   ACTIVE ANCHOR LINKS (Safe Selector Handling)
───────────────────────────────────────────── */
function initAnchorLinks() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 90;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } catch (err) {
        // Ignore invalid CSS selector
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
